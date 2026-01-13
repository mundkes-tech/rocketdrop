// src/app/api/orders/cancel/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-middleware';
import { sendCancellationEmail, sendCancellationAdminEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/orders/cancel
 * Cancel an order and optionally refund the payment
 */
export async function POST(req) {
  return requireAuth(req, async (req, user) => {
    try {
      const { orderId, reason } = await req.json();

      if (!orderId) {
        return NextResponse.json(
          { success: false, message: 'Order ID is required' },
          { status: 400 }
        );
      }

      // Fetch order to verify ownership and check status
      const [orders] = await db.query(
        'SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1',
        [orderId, user.id]
      );

      if (orders.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Order not found or unauthorized' },
          { status: 404 }
        );
      }

      const order = orders[0];

      // Check if order can be cancelled
      const canBeCancelled = ['pending', 'processing'].includes(order.status);
      if (!canBeCancelled) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot cancel order with status: ${order.status}. Only pending or processing orders can be cancelled.`,
          },
          { status: 400 }
        );
      }

      // If payment was made with Stripe, refund it
      let refundData = null;
      if (order.payment_status === 'paid' && order.stripe_payment_id) {
        try {
          console.log('💰 Processing refund for order:', orderId);
          const refund = await stripe.refunds.create({
            payment_intent: order.stripe_payment_id,
            metadata: {
              order_id: orderId.toString(),
              reason: reason || 'Customer requested cancellation',
            },
          });

          refundData = {
            refund_id: refund.id,
            amount: refund.amount / 100, // Convert from paise to rupees
            status: refund.status,
          };

          console.log('✅ Refund created:', refundData);
        } catch (refundErr) {
          console.error('❌ Refund error:', refundErr);
          // Continue with cancellation even if refund fails - order will need manual review
          refundData = {
            error: refundErr.message,
            status: 'failed',
          };
        }
      }

      // Update order status to cancelled
      const [result] = await db.query(
        `UPDATE orders 
         SET status = 'cancelled', 
             payment_status = CASE 
               WHEN payment_status = 'paid' THEN 'refunded'
               ELSE payment_status 
             END,
             cancellation_reason = ?,
             cancelled_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [reason || 'User requested cancellation', orderId]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: 'Failed to cancel order' },
          { status: 500 }
        );
      }

      // Fetch cancelled order details for email
      const [cancelledOrders] = await db.query(
        'SELECT * FROM orders WHERE id = ? LIMIT 1',
        [orderId]
      );

      const cancelledOrder = cancelledOrders[0];

      // Send cancellation email to user
      try {
        console.log('📧 Sending cancellation email to:', user.email);
        const emailResult = await sendCancellationEmail(user.email, user.name || user.email, {
          orderId,
          amount: parseFloat(order.total_amount),
          reason: reason || 'User requested cancellation',
          refund: refundData,
        });
        console.log('📧 Email result:', emailResult);
        if (!emailResult.success) {
          console.error('⚠️ Email notification failed:', emailResult.error);
        }
      } catch (emailErr) {
        console.error('⚠️ Email exception:', emailErr.message);
        console.error('⚠️ Full error:', emailErr);
        // Don't fail the cancellation if email fails
      }

      // Send admin notification email
      try {
        console.log('📧 Sending admin cancellation notification');
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          const adminEmailResult = await sendCancellationAdminEmail(adminEmail, {
            orderId,
            amount: parseFloat(order.total_amount),
            reason: reason || 'User requested cancellation',
            refund: refundData,
          }, {
            name: user.name || user.email,
            email: user.email,
          });
          console.log('📧 Admin email result:', adminEmailResult);
          if (!adminEmailResult.success) {
            console.error('⚠️ Admin email notification failed:', adminEmailResult.error);
          }
        } else {
          console.warn('⚠️ ADMIN_EMAIL not configured in environment variables');
        }
      } catch (adminEmailErr) {
        console.error('⚠️ Admin email exception:', adminEmailErr.message);
        // Don't fail the cancellation if admin email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          order: cancelledOrder,
          refund: refundData,
        },
      });
    } catch (error) {
      console.error('❌ Order cancellation error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to cancel order',
          error: error.message,
        },
        { status: 500 }
      );
    }
  });
}
