import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!sessions.data.length) return;

      const { orderIds, userId, appId } = sessions.data[0].metadata;

      if (appId !== "jeeshop") {
        return;
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        await Promise.all(
          orderIdsArray.map((orderId) =>
            prisma.order.update({
              where: { id: orderId },
              data: { isPaid: true },
            })
          )
        );

        await prisma.user.update({
          where: { id: userId },
          data: { cart: {} },
        });
      } else {
        await Promise.all(
          orderIdsArray.map((orderId) =>
            prisma.order.delete({
              where: { id: orderId },
            })
          )
        );
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntent(event.data.object.id, true);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntent(event.data.object.id, false);
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
