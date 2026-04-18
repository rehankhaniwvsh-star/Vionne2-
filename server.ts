import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import twilio from "twilio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const resend = new Resend(process.env.RESEND_API_KEY);

  const getTwilioClient = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) return null;
    return twilio(accountSid, authToken);
  };

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Vionne Admin API is running" });
  });

  app.post("/api/checkout", async (req, res) => {
    const { orderData } = req.body;
    
    console.log("Processing order:", orderData);
    
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const twilioClient = getTwilioClient();
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER;
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;

    // --- Email Logic ---
    if (RESEND_API_KEY) {
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
