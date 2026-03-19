import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Vionne Admin API is running" });
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
