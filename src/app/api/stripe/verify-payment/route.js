// src/app/api/stripe/verify-payment/route.js
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/stripe/verify-payment
 * Verify Stripe payment and update order status
 */
export async function POST(req) {
  return requireAuth(req, async (req, user) => {
    try {
      const { sessionId, orderId } = await req.json();

      // Validate required fields
      if (!sessionId || !orderId) {
        return NextResponse.json(
          { success: false, message: 'Missing session ID or order ID' },
          { status: 400 }
        );
      }

      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Check if payment was successful
      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { success: false, message: 'Payment not completed' },
          { status: 400 }
        );
      }

      // Update order in database
      const [result] = await db.query(
        `UPDATE orders 
         SET payment_status = 'paid', 
             stripe_session_id = ?, 
             stripe_payment_id = ?,
             payment_method = 'stripe',
             updated_at = NOW()
         WHERE id = ? AND user_id = ?`,
        [session.id, session.payment_intent || session.id, orderId, user.id]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: 'Order not found or unauthorized' },
          { status: 404 }
        );
      }

      // Fetch updated order details
      const [orders] = await db.query(
        'SELECT * FROM orders WHERE id = ? LIMIT 1',
        [orderId]
      );

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          order: orders[0],
          payment: {
            stripe_session_id: session.id,
            stripe_payment_id: session.payment_intent,
          },
        },
      });
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Payment verification failed',
          error: error.message,
        },
        { status: 500 }
      );
    }
  });
}

/**
 * Webhook handler for Stripe events
 * POST /api/stripe/webhook
 */
export async function handleStripeWebhook(req) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Update order status
      const [result] = await db.query(
        `UPDATE orders 
         SET payment_status = 'paid', 
             stripe_session_id = ?, 
             stripe_payment_id = ?,
             payment_method = 'stripe',
             updated_at = NOW()
         WHERE id = ? AND payment_status = 'pending'`,
        [session.id, session.payment_intent || session.id, session.metadata.order_id]
      );

      if (result.affectedRows > 0) {
        console.log(`✅ Order ${session.metadata.order_id} payment confirmed via webhook`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }

  return NextResponse.json({ received: true });
}
