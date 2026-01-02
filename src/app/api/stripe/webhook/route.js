// src/app/api/stripe/webhook/route.js
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Webhook handler for Stripe events
 * POST /api/stripe/webhook
 * 
 * Stripe will send payment confirmation events to this endpoint
 * Configure in Stripe Dashboard: Settings > Webhooks
 * 
 * Events to listen for:
 * - checkout.session.completed
 * - payment_intent.succeeded
 * - charge.refunded
 */
export async function POST(req) {
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
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log(`📦 Processing payment for order: ${session.metadata?.order_id}`);

    try {
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.warn('⚠️ No order_id in webhook metadata');
        return NextResponse.json({ received: true });
      }

      // Update order status in database
      const [result] = await db.query(
        `UPDATE orders 
         SET payment_status = 'paid', 
             stripe_session_id = ?, 
             stripe_payment_id = ?,
             payment_method = 'stripe',
             updated_at = NOW()
         WHERE id = ? AND payment_status = 'pending'`,
        [session.id, session.payment_intent || session.id, orderId]
      );

      if (result.affectedRows > 0) {
        console.log(`✅ Order ${orderId} payment confirmed via Stripe webhook`);
      } else {
        console.warn(`⚠️ Order ${orderId} not found or already updated`);
      }
    } catch (error) {
      console.error('❌ Error updating order from webhook:', error);
    }
  }

  // Handle payment_intent.succeeded event (optional, for additional confirmation)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`✅ Payment intent succeeded:`, paymentIntent.id);
  }

  // Handle charge.refunded event (for refunds)
  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    console.log(`💳 Charge refunded:`, charge.id);
    
    try {
      // You can handle refund logic here if needed
      // Example: Update order status to 'refunded'
    } catch (error) {
      console.error('Error handling refund:', error);
    }
  }

  // Acknowledge receipt of event
  return NextResponse.json({ received: true });
}
