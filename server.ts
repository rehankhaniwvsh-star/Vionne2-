import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import twilio from "twilio";
import Razorpay from "razorpay";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    return new Resend(apiKey);
  };

  const getTwilioClient = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) return null;
    return twilio(accountSid, authToken);
  };

  const RAZORPAY_DEFAULT_KEY_ID = "rzp_live_TlizK7xD4lJ68X";
  const RAZORPAY_DEFAULT_KEY_SECRET = "fBf2ttVuwwLs704tTksjy5DX";

  const getActiveRazorpayConfig = () => {
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || RAZORPAY_DEFAULT_KEY_ID).trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || RAZORPAY_DEFAULT_KEY_SECRET).trim();
    return { keyId, keySecret };
  };

  const getRazorpayInstance = () => {
    const { keyId, keySecret } = getActiveRazorpayConfig();
    if (!keyId || !keySecret) return null;
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  };

  // API routes
  app.get("/api/health", (req, res) => {
    const { keyId, keySecret } = getActiveRazorpayConfig();
    res.json({ 
      status: "ok", 
      message: "Vionne Admin API with Razorpay is running",
      razorpayConfigured: Boolean(keyId && keySecret)
    });
  });

  app.get("/api/razorpay-config", (req, res) => {
    const { keyId } = getActiveRazorpayConfig();
    res.json({
      key_id: keyId,
    });
  });

  // STEP 1: BACKEND - Create Razorpay Order
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt, notes } = req.body;

      if (amount === undefined || amount === null || isNaN(Number(amount))) {
        return res.status(400).json({ 
          error: "Amount is required and must be a valid number in paise" 
        });
      }

      const numericAmount = Math.round(Number(amount));
      // Razorpay enforces minimum order amount of 100 paise (₹1.00)
      if (numericAmount < 100) {
        return res.status(400).json({ 
          error: "Amount must be at least 100 paise (₹1.00)" 
        });
      }

      const { keyId, keySecret } = getActiveRazorpayConfig();

      if (!keyId || !keySecret) {
        return res.status(401).json({ 
          error: "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." 
        });
      }

      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        return res.status(401).json({ 
          error: "Authentication failed: Unable to initialize Razorpay client with credentials" 
        });
      }

      const receiptId = (receipt || `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`).slice(0, 40);

      const order = await razorpay.orders.create({
        amount: numericAmount,
        currency: String(currency).toUpperCase(),
        receipt: receiptId,
        notes: notes || {},
      });

      console.log(`Razorpay order created successfully: ${order.id} for ₹${numericAmount / 100}`);

      return res.status(200).json({
        order_id: order.id,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        key_id: keyId,
      });
    } catch (err: any) {
      console.error("Razorpay order creation error:", err);

      const statusCode = err?.statusCode || (err?.error?.code === "BAD_REQUEST_ERROR" && err?.error?.description?.toLowerCase().includes("unauthorized") ? 401 : 500);

      return res.status(statusCode).json({
        error: err?.error?.description || err.message || "Failed to create Razorpay order",
        code: err?.error?.code || "RAZORPAY_ERROR",
      });
    }
  });

  // STEP 3: BACKEND - Verify Payment Signature
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const {
        razorpay_order_id,
        order_id,
        razorpay_payment_id,
        payment_id,
        razorpay_signature,
        orderData,
      } = req.body;

      const resolvedOrderId = razorpay_order_id || order_id;
      const resolvedPaymentId = razorpay_payment_id || payment_id;

      if (!resolvedOrderId || !resolvedPaymentId || !razorpay_signature) {
        return res.status(400).json({
          error: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
          verified: false,
        });
      }

      const { keySecret } = getActiveRazorpayConfig();
      if (!keySecret) {
        return res.status(500).json({
          error: "Server configuration error: RAZORPAY_KEY_SECRET is missing",
          verified: false,
        });
      }

      // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      const payload = `${resolvedOrderId}|${resolvedPaymentId}`;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(payload)
        .digest("hex");

      const isMatch =
        generatedSignature.length === razorpay_signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(generatedSignature, "utf-8"),
          Buffer.from(razorpay_signature, "utf-8")
        );

      if (!isMatch) {
        console.warn(`Payment signature verification failed for Order: ${resolvedOrderId}, Payment: ${resolvedPaymentId}`);
        return res.status(400).json({
          error: "Invalid payment signature: Signature mismatch. Verification failed.",
          verified: false,
        });
      }

      console.log(`Payment signature verified successfully for Order: ${resolvedOrderId}, Payment: ${resolvedPaymentId}`);

      // Dispatch order confirmations if orderData was supplied
      if (orderData) {
        const resend = getResendClient();
        const twilioClient = getTwilioClient();
        const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER;
        const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;

        if (resend && orderData.customer?.email) {
          try {
            const itemsHtml = (orderData.items || []).map((item: any) => 
              `<li>${item.title} x ${item.quantity} - ₹${(item.price || 0).toLocaleString('en-IN')}</li>`
            ).join("");

            await resend.emails.send({
              from: "Vionne <onboarding@resend.dev>",
              to: orderData.customer.email,
              subject: `Order & Payment Confirmed - #${orderData.shortId || resolvedOrderId}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #111;">
                  <h2>Thank You for Your Order!</h2>
                  <p>Payment of <strong>₹${(orderData.total || 0).toLocaleString('en-IN')}</strong> was successfully verified via Razorpay.</p>
                  <p><strong>Razorpay Payment ID:</strong> ${resolvedPaymentId}</p>
                  <p><strong>Order ID:</strong> #${orderData.shortId || resolvedOrderId}</p>
                  <h3>Items:</h3>
                  <ul>${itemsHtml}</ul>
                </div>
              `,
            }).catch(e => console.error("Resend confirmation error:", e));
          } catch (e) {
            console.error("Resend send failed:", e);
          }
        }

        if (twilioClient && twilioFrom && orderData.customer?.phone) {
          try {
            const customerPhone = orderData.customer.phone.replace(/\D/g, '');
            await twilioClient.messages.create({
              from: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
              to: `whatsapp:+${customerPhone}`,
              body: `Hello ${orderData.customer.name}, your payment for order #${orderData.shortId || resolvedOrderId} of ₹${(orderData.total || 0).toLocaleString('en-IN')} is confirmed via Razorpay! Thank you for shopping with Vionne.`,
            }).catch(e => console.error("Twilio customer whatsapp error:", e));

            if (adminPhone) {
              await twilioClient.messages.create({
                from: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
                to: adminPhone.startsWith('whatsapp:') ? adminPhone : `whatsapp:${adminPhone}`,
                body: `💎 NEW PAID ORDER!\nPayment ID: ${resolvedPaymentId}\nOrder: #${orderData.shortId || resolvedOrderId}\nCustomer: ${orderData.customer.name}\nAmount: ₹${(orderData.total || 0).toLocaleString('en-IN')}`,
              }).catch(e => console.error("Twilio admin whatsapp error:", e));
            }
          } catch (e) {
            console.error("Twilio dispatch failed:", e);
          }
        }
      }

      return res.status(200).json({
        success: true,
        verified: true,
        message: "Payment signature verified successfully",
        payment_id: resolvedPaymentId,
        order_id: resolvedOrderId,
      });
    } catch (err: any) {
      console.error("Payment verification internal error:", err);
      return res.status(500).json({
        error: "Internal error during payment verification",
        details: err.message,
        verified: false,
      });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    const { orderData } = req.body;
    
    console.log("Processing order:", orderData);
    
    const resend = getResendClient();
    const twilioClient = getTwilioClient();
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER;
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;

    // --- Email Logic ---
    if (resend) {
      try {
        const itemsHtml = orderData.items.map((item: any) => 
          `<li>${item.title} x ${item.quantity} - ₹${item.price.toLocaleString('en-IN')}</li>`
        ).join("");

        const emailContent = `
          <div style="font-family: serif; padding: 20px; color: #333; text-align: left;">
            <h1 style="border-bottom: 2px solid #000; padding-bottom: 10px;">Order Confirmation</h1>
            <p>Hello <strong>${orderData.customer.name}</strong>,</p>
            <p>Thank you for shopping with Vionne. Your order has been received and is being processed.</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Order ID:</strong> #${orderData.shortId || orderData.id}</p>
              <p><strong>Total Amount:</strong> ₹${orderData.total.toLocaleString('en-IN')}</p>
            </div>

            <h3>Order Items:</h3>
            <ul>${itemsHtml}</ul>

            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              Vionne Luxury Essentials - Timeless Elegance
            </p>
          </div>
        `;

        await resend.emails.send({
          from: "Vionne <onboarding@resend.dev>",
          to: orderData.customer.email,
          subject: `Order Received - #${orderData.shortId || orderData.id}`,
          html: emailContent,
        });

        await resend.emails.send({
          from: "Vionne <onboarding@resend.dev>",
          to: "uzafa.shop@gmail.com",
          subject: `New Order Alert: #${orderData.shortId || orderData.id}`,
          html: `
            <h1>New Order Received</h1>
            <p><strong>Customer:</strong> ${orderData.customer.name}</p>
            <p><strong>Email:</strong> ${orderData.customer.email}</p>
            <p><strong>Phone:</strong> ${orderData.customer.phone}</p>
            <p><strong>Order ID:</strong> #${orderData.shortId || orderData.id}</p>
            <p><strong>Total:</strong> ₹${orderData.total.toLocaleString('en-IN')}</p>
            <h3>Items:</h3>
            <ul>${itemsHtml}</ul>
          `,
        });
      } catch (err) {
        console.error("Email notification failed:", err);
      }
    }

    // --- WhatsApp Logic ---
    if (twilioClient && twilioFrom) {
      try {
        const customerPhone = orderData.customer.phone.replace(/\D/g, '');
        const messageBody = `Hello ${orderData.customer.name}, your order #${orderData.shortId || orderData.id} for ₹${orderData.total.toLocaleString('en-IN')} has been received! Thank you for shopping with Vionne.`;

        await twilioClient.messages.create({
          from: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
          to: `whatsapp:+${customerPhone}`,
          body: messageBody
        });

        if (adminPhone) {
          await twilioClient.messages.create({
            from: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
            to: adminPhone.startsWith('whatsapp:') ? adminPhone : `whatsapp:${adminPhone}`,
            body: `🚨 NEW ORDER RECEIVED!\n\nCustomer: ${orderData.customer.name}\nAmount: ₹${orderData.total.toLocaleString('en-IN')}\nOrder ID: #${orderData.shortId || orderData.id}`
          });
        }
      } catch (err) {
        console.error("WhatsApp notification failed:", err);
      }
    }

    res.json({ 
      success: true, 
      message: "Order processed and notifications triggered"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production setup
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
