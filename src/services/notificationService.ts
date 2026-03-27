export interface NotificationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  total: number;
}

class NotificationService {
  /**
   * Sends an email notification to the customer about their order status.
   * In a real production app, this would call a backend API (e.g., SendGrid, Mailgun, or AWS SES).
   */
  async sendEmailNotification(data: NotificationData) {
    const { orderId, customerName, customerEmail, status, total } = data;
    
    console.log(`[Email Notification] Sending to ${customerEmail}...`);
    console.log(`Subject: Order ${orderId} Status Update: ${status}`);
    console.log(`Body: Hello ${customerName}, your order ${orderId} for ₹${total.toLocaleString('en-IN')} is now ${status}.`);
    
    // Example of how you would call a real API:
    /*
    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          subject: `Order ${orderId} Status Update: ${status}`,
          text: `Hello ${customerName}, your order ${orderId} is now ${status}.`
        })
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
    */
  }

  /**
   * Sends a WhatsApp notification to the customer about their order status.
   * In a real production app, this would call a WhatsApp Business API (e.g., via Twilio or Meta).
   */
  async sendWhatsAppNotification(data: NotificationData) {
    const { orderId, customerName, customerPhone, status, total } = data;
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = customerPhone.replace(/\D/g, '');
    
    console.log(`[WhatsApp Notification] Sending to ${cleanPhone}...`);
    console.log(`Message: Hello ${customerName}, your order ${orderId} for ₹${total.toLocaleString('en-IN')} is now ${status}. Thank you for shopping with us!`);

    // Example of how you would call a real API (e.g., Twilio):
    /*
    try {
      await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: `whatsapp:+${cleanPhone}`,
          message: `Hello ${customerName}, your order ${orderId} is now ${status}.`
        })
      });
    } catch (error) {
      console.error('Failed to send WhatsApp:', error);
    }
    */
  }

  /**
   * Triggers all notifications for an order status update.
   */
  async notifyOrderStatusUpdate(order: any) {
    const data: NotificationData = {
      orderId: order.id,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      status: order.status,
      total: Number(order.total) || 0
    };

    await Promise.all([
      this.sendEmailNotification(data),
      this.sendWhatsAppNotification(data)
    ]);
  }
}

export const notificationService = new NotificationService();
