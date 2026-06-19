import type { Checkout, Stripe as StripeClient } from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

type StripeWebhookEvent = ReturnType<StripeClient['webhooks']['constructEvent']>;

@Injectable()
export class StripeService {
  private stripe: StripeClient;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  /*
    Create a checkout session for a course purchase.
    Ask Stripe to set up a payment page for this purchase.
  */
  async createCheckoutSession(params: {
    courseId: string;
    userId: string;
    courseTitle: string;
    amount: number;
    currency: string;
  }): Promise<Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'], // ("amazon_pay" | "card" | "cashapp" | "crypto" | "paypal", ...) 
      mode: 'payment', // ("payment" | "setup" | "subscription")
      line_items: [ // shopping cart — what's actually being bought
        {
          price_data: {
            currency: params.currency,
            product_data: { name: params.courseTitle },
            unit_amount: Math.round(params.amount * 100), // A non-negative integer in cents
          },
          quantity: 1,
        },
      ],
      metadata: { // needed when Stripe notifies you the payment succeeded via a webhook
        courseId: params.courseId, // session.metadata.courseId
        userId: params.userId, // session.metadata.userId
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.FRONTEND_URL}/payment/cancel`,
    });
  }

  // Verify webhook signature and return the event
  // this request genuinely came from Stripe and wasn't tampered with as the endpoint is public
  constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): StripeWebhookEvent {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
    );
  }
}