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

/**
 * Send order cancellation email
 */
export async function sendCancellationEmail(userEmail, userName, orderData) {
  try {
    console.log('📧 [CANCELLATION EMAIL] Starting email send to:', userEmail);
    const { orderId, amount, reason, refund } = orderData;

    const transporter = createTransporter();
    
    console.log('📧 [CANCELLATION EMAIL] Email config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER ? '***' : 'MISSING',
      password: process.env.EMAIL_PASSWORD ? '***' : 'MISSING',
    });

    const refundStatusHtml = refund?.refund_id
      ? `
        <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #1e40af; margin: 0 0 10px 0;">Refund Status</h3>
          <p><strong>Refund ID:</strong> ${refund.refund_id}</p>
          <p><strong>Refund Amount:</strong> ₹${refund.amount?.toFixed(2) || 'Processing'}</p>
          <p><strong>Status:</strong> <span style="color: ${refund.status === 'succeeded' ? '#10b981' : '#f59e0b'}; font-weight: bold;">${refund.status?.toUpperCase() || 'PENDING'}</span></p>
          <p style="font-size: 12px; color: #666; margin: 10px 0 0 0;">The refund will be credited back to your original payment method within 5-7 business days.</p>
        </div>
      `
      : `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;"><strong>Note:</strong> No payment was made for this order, so no refund is being processed.</p>
        </div>
      `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RocketDrop <noreply@rocketdrop.com>',
      to: userEmail,
      subject: `Order Cancellation Confirmed - Order #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Cancellation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
            <h1 style="color: #dc2626; margin: 0 0 20px 0; text-align: center;">Order Cancellation Confirmed</h1>
            
            <p>Hi ${userName},</p>
            
            <p>We've successfully cancelled your order.</p>
            
            <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Order Details</h2>
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Amount:</strong> ₹${typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount).toFixed(2)}</p>
              <p><strong>Cancellation Reason:</strong> ${reason || 'Customer requested'}</p>
              <p><strong>Cancelled At:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            ${refundStatusHtml}

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #374151; margin: 0 0 10px 0;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666;">
                <li>Your order has been marked as cancelled in our system</li>
                <li>If a refund was processed, it will appear in your account within 5-7 business days</li>
                <li>You can view your order history anytime from your account</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">If you have any questions or need further assistance, please contact our support team.</p>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              © 2026 RocketDrop. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [CANCELLATION EMAIL] Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [CANCELLATION EMAIL] Error:', error.message);
    console.error('❌ [CANCELLATION EMAIL] Full error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send admin notification for order cancellation
 */
export async function sendCancellationAdminEmail(adminEmail, orderData, userData) {
  try {
    console.log('📧 [ADMIN CANCELLATION EMAIL] Starting email send to admin:', adminEmail);
    const { orderId, amount, reason, refund } = orderData;
    const { name: userName, email: userEmail } = userData;

    const transporter = createTransporter();

    const refundStatusHtml = refund?.refund_id
      ? `
        <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #047857; margin: 0 0 10px 0;">Refund Processed</h3>
          <p><strong>Refund ID:</strong> ${refund.refund_id}</p>
          <p><strong>Refund Amount:</strong> ₹${typeof refund.amount === 'number' ? refund.amount.toFixed(2) : parseFloat(refund.amount).toFixed(2)}</p>
          <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">${refund.status?.toUpperCase() || 'PENDING'}</span></p>
        </div>
      `
      : `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;"><strong>Note:</strong> This was a pending order with no payment, so no refund needed.</p>
        </div>
      `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RocketDrop <noreply@rocketdrop.com>',
      to: adminEmail,
      subject: `[ADMIN] Order Cancelled - Order #${orderId} by ${userName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Cancellation Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
            <h1 style="color: #dc2626; margin: 0 0 20px 0; text-align: center;">🚨 Order Cancellation Alert</h1>
            
            <p>A customer has cancelled their order. Please review the details below:</p>
            
            <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Order Information</h2>
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Order Amount:</strong> ₹${typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount).toFixed(2)}</p>
              <p><strong>Cancellation Reason:</strong> ${reason || 'User did not provide reason'}</p>
              <p><strong>Cancelled At:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Customer Information</h2>
              <p><strong>Customer Name:</strong> ${userName || 'N/A'}</p>
              <p><strong>Customer Email:</strong> ${userEmail}</p>
            </div>

            ${refundStatusHtml}

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">Action Required</h3>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                <li>Review the cancellation reason</li>
                ${refund?.refund_id ? '<li>Verify refund has been processed successfully</li>' : '<li>No refund required for this order</li>'}
                <li>Consider reaching out to customer if follow-up is needed</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              © 2026 RocketDrop Admin System
            </p>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [ADMIN CANCELLATION EMAIL] Email sent to admin successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [ADMIN CANCELLATION EMAIL] Error:', error.message);
    console.error('❌ [ADMIN CANCELLATION EMAIL] Full error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send invoice email with PDF attachment
 */
export async function sendInvoiceEmail(orderData, pdfBuffer) {
  try {
    const { customer_email, customer_name, order_id, total_amount, order_status } = orderData;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RocketDrop <noreply@rocketdrop.com>',
      to: customer_email,
      subject: `Invoice for Order #${order_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📄 Invoice Ready</h1>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${customer_name || 'Customer'},</p>

            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              Your invoice for Order #${order_id} is ready! Please find the PDF invoice attached to this email.
            </p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">#${order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Total Amount:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #059669;">$${total_amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Order Status:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; text-transform: capitalize;">${order_status}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>📎 Attachment:</strong> Your invoice PDF is attached to this email. You can also download it from your order history anytime.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/myorders" 
                 style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Order Details
              </a>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions about this invoice, please don't hesitate to contact us.
            </p>

            <p style="font-size: 14px; color: #666;">
              Thank you for shopping with us!<br>
              <strong>The RocketDrop Team</strong>
            </p>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `invoice-${order_id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [INVOICE EMAIL] Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [INVOICE EMAIL] Error:', error.message);
    console.error('❌ [INVOICE EMAIL] Full error:', error);
    return { success: false, error: error.message };
  }
}

