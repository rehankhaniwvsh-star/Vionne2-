import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
app.use(express.json());

// API routes go here
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Vionne Admin API is running on Vercel" });
});

app.post("/api/checkout", (req, res) => {
  const { orderData } = req.body;
  
  console.log("Processing order:", orderData);
  
  // Mock sending email and SMS
  console.log(`[MOCK] Sending confirmation email to: ${orderData.customer.email}`);
  console.log(`[MOCK] Sending confirmation SMS to: ${orderData.customer.phone}`);
  
  res.json({ 
    success: true, 
    message: "Order processed and notifications sent",
    notifications: {
      email: "sent",
      sms: "sent"
    }
  });
});

// Export the app for Vercel
export default app;
