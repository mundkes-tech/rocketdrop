// src/app/api/stripe/create-session/route.js
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/stripe/create-session
 * Create a Stripe checkout session
 */
export async function POST(req) {
  return requireAuth(req, async (req, user) => {
    try {
      const { amount, orderId, items, shipping } = await req.json();

      // Validate required fields
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, message: 'Invalid amount' },
          { status: 400 }
        );
      }

      if (!orderId) {
        return NextResponse.json(
          { success: false, message: 'Order ID is required' },
          { status: 400 }
        );
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item) => ({
          price_data: {
            currency: 'inr', // Change to your currency
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100), // Amount in smallest currency unit (cents/paise)
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/myorders?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
        customer_email: user.email,
        metadata: {
          order_id: orderId.toString(),
          user_id: user.id.toString(),
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 0, // Free shipping
                currency: 'inr',
              },
              display_name: 'Free Shipping',
            },
          },
        ],
      });

      return NextResponse.json({
        success: true,
        message: 'Checkout session created successfully',
        sessionId: session.id,
      });
    } catch (error) {
      console.error('❌ Stripe session creation error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create checkout session',
          error: error.message,
        },
        { status: 500 }
      );
    }
  });
}
