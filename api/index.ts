import express from "express";
import { Resend } from "resend";
import twilio from "twilio";

const app = express();
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// Twilio Client initialized lazily (see guide)
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
};

// API routes go here
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Vionne Admin API is running on Vercel" });
});

app.post("/api/checkout", async (req, res) => {
  const { orderData } = req.body;
  
  console.log("Processing order:", orderData);
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const twilioClient = getTwilioClient();
  const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER; // e.g., 'whatsapp:+91...'

  // --- Email Logic ---
  if (RESEND_API_KEY) {
    try {
      const itemsHtml = orderData.items.map((item: any) => 
        `<li>${item.title} x ${item.quantity} - ₹${item.price.toLocaleString('en-IN')}</li>`
      ).join("");

      const emailContent = `
        <div style="font-family: serif; padding: 20px; color: #333 text-align: left;">
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

      // Customer Email
      await resend.emails.send({
        from: "Vionne <onboarding@resend.dev>",
        to: orderData.customer.email,
        subject: `Order Received - #${orderData.shortId || orderData.id}`,
        html: emailContent,
      });

      // Admin Email
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
      const messageBody = `Hello ${orderData.customer.name}, your order #${orderData.shortId || orderData.id} for ₹${orderData.total.toLocaleString('en-IN')} has been received! Thank you for shopping with Vionne. Luxury is on its way.`;

      // 1. Send to Customer
      await twilioClient.messages.create({
        from: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
        to: `whatsapp:+${customerPhone}`,
        body: messageBody
      });

      // 2. Send to Admin (if admin number provided)
      if (adminPhone) {
        await twilioClient.messages.create({
          from: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
          to: adminPhone.startsWith('whatsapp:') ? adminPhone : `whatsapp:${adminPhone}`,
          body: `🚨 NEW ORDER RECEIVED!\n\nCustomer: ${orderData.customer.name}\nAmount: ₹${orderData.total.toLocaleString('en-IN')}\nOrder ID: #${orderData.shortId || orderData.id}\n\nCheck admin panel for details.`
        });
      }
      
      console.log("WhatsApp notifications sent successfully");
    } catch (err) {
      console.error("WhatsApp notification failed:", err);
    }
  }

  res.json({ 
    success: true, 
    message: "Order processed and notifications triggered"
  });
});

// Export the app for Vercel
export default app;
