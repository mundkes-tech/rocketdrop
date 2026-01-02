// src/lib/email.js
import nodemailer from 'nodemailer';

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(orderData) {
  try {
    const { user_email, user_name, order_id, total, items, shipping_address } = orderData;

    const transporter = createTransporter();

    // Generate items HTML
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RocketDrop <noreply@rocketdrop.com>',
      to: user_email,
      subject: `Order Confirmation - Order #${order_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🚀 Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for shopping with RocketDrop</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${user_name},</p>
            <p style="font-size: 14px; color: #666;">Your order has been successfully placed and is being processed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="margin: 0 0 10px 0; color: #667eea; font-size: 18px;">Order Details</h2>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order_id}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
            </div>

            <h3 style="color: #667eea; font-size: 16px; margin-top: 30px;">Order Items</h3>
            <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; margin-top: 10px;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="background: #f9f9f9; font-weight: bold;">
                  <td colspan="3" style="padding: 15px; text-align: right;">Grand Total:</td>
                  <td style="padding: 15px; text-align: right; color: #667eea; font-size: 18px;">₹${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #667eea; font-size: 16px; margin-top: 0;">Shipping Address</h3>
              <p style="margin: 5px 0; color: #666; white-space: pre-line;">${shipping_address}</p>
            </div>

            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2196F3;">
              <p style="margin: 0; color: #0277BD; font-size: 14px;">
                <strong>📦 Track Your Order:</strong> Visit your <a href="${process.env.NEXT_PUBLIC_API_URL}/myorders" style="color: #0277BD; text-decoration: underline;">My Orders</a> page to track your shipment.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">Questions? Contact us at support@rocketdrop.com</p>
              <p style="color: #999; font-size: 13px; margin: 5px 0;">© ${new Date().getFullYear()} RocketDrop. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send admin notification for new order
 */
export async function sendAdminOrderNotification(orderData) {
  try {
    const { order_id, user_name, user_email, total, items } = orderData;
    const adminEmail = process.env.EMAIL_USER; // Send to the same email configured

    const transporter = createTransporter();

    const itemsList = items.map(item => 
      `- ${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RocketDrop <noreply@rocketdrop.com>',
      to: adminEmail,
      subject: `🔔 New Order Received - #${order_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: #f44336; color: white; padding: 20px; border-radius: 8px;">
            <h2 style="margin: 0;">🔔 New Order Notification</h2>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            <p><strong>Order ID:</strong> #${order_id}</p>
            <p><strong>Customer:</strong> ${user_name} (${user_email})</p>
            <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
            <h3>Items:</h3>
            <pre style="background: white; padding: 15px; border-radius: 5px;">${itemsList}</pre>
            <a href="${process.env.NEXT_PUBLIC_API_URL}/admin/orders" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View in Admin Panel</a>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Admin email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({ user_email, user_name, reset_url }) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RocketDrop <noreply@rocketdrop.com>',
      to: user_email,
      subject: 'Reset Your Password - RocketDrop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔒 Reset Your Password</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">RocketDrop Account Security</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${user_name},</p>
            <p style="font-size: 14px; color: #666;">We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reset_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Reset Password
              </a>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
              </p>
            </div>

            <p style="font-size: 13px; color: #999; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${reset_url}" style="color: #667eea; word-break: break-all;">${reset_url}</a>
            </p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">Need help? Contact us at support@rocketdrop.com</p>
              <p style="color: #999; font-size: 13px; margin: 5px 0;">© ${new Date().getFullYear()} RocketDrop. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    return { success: false, error: error.message };
  }
}
