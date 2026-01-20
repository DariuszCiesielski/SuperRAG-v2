import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2024-11-20",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Helper to check if this is a Legal Assistant subscription
function isLegalProduct(metadata: Stripe.Metadata | null): boolean {
  return metadata?.product === "legal_assistant";
}

// Helper to get legal plan type from metadata
function getLegalPlanType(metadata: Stripe.Metadata | null): string {
  return metadata?.plan_type || "pro_legal";
}

// Get limits for legal plan
function getLegalPlanLimits(planType: string): { cases_limit: number | null; documents_limit: number | null } {
  switch (planType) {
    case "pro_legal":
      return { cases_limit: null, documents_limit: null }; // unlimited
    case "business_legal":
      return { cases_limit: null, documents_limit: null }; // unlimited
    default:
      return { cases_limit: 2, documents_limit: 3 }; // free limits
  }
}

Deno.serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");

  if (!signature) {
    return new Response("Missing Stripe-Signature header", { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Received event: ${event.type} (${event.id})`);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);

        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const userId = session.metadata?.user_id;

          if (!userId) {
            console.error("No user_id in session metadata");
            break;
          }

          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Check if this is a Legal Assistant subscription
          if (isLegalProduct(session.metadata)) {
            const planType = getLegalPlanType(session.metadata);
            const limits = getLegalPlanLimits(planType);

            console.log(`Processing Legal Assistant subscription: ${planType}`);

            // Update legal subscription fields
            const { error } = await supabase
              .from("subscriptions")
              .update({
                stripe_customer_id: customerId,
                // Keep stripe_subscription_id for the main subscription
                // For legal, we track via legal_plan_id
                legal_plan_id: planType,
                legal_cases_limit: limits.cases_limit,
                legal_documents_limit: limits.documents_limit,
                legal_documents_generated: 0, // Reset monthly counter
              })
              .eq("user_id", userId);

            if (error) {
              console.error("Error updating legal subscription:", error);
            } else {
              console.log(`Updated legal subscription for user ${userId} to ${planType}`);
            }
          } else {
            // Standard Pro subscription (not Legal)
            const { error } = await supabase
              .from("subscriptions")
              .update({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan_id: "pro",
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
              })
              .eq("user_id", userId);

            if (error) {
              console.error("Error updating subscription:", error);
            } else {
              console.log(`Updated subscription for user ${userId} to pro`);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", subscription.id);

        // Check if this is a legal subscription by checking metadata
        if (isLegalProduct(subscription.metadata)) {
          const planType = getLegalPlanType(subscription.metadata);
          const limits = getLegalPlanLimits(planType);

          // For canceled subscriptions, revert to free
          if (subscription.status === "canceled" || subscription.cancel_at_period_end) {
            // Will be handled in subscription.deleted
            console.log(`Legal subscription ${subscription.id} is being canceled`);
          }

          // Update legal plan status if active
          if (subscription.status === "active") {
            const { error } = await supabase
              .from("subscriptions")
              .update({
                legal_plan_id: planType,
                legal_cases_limit: limits.cases_limit,
                legal_documents_limit: limits.documents_limit,
              })
              .eq("stripe_customer_id", subscription.customer as string);

            if (error) {
              console.error("Error updating legal subscription:", error);
            }
          }
        } else {
          // Standard subscription update
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq("stripe_subscription_id", subscription.id);

          if (error) {
            console.error("Error updating subscription:", error);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);

        // Check if this is a legal subscription
        if (isLegalProduct(subscription.metadata)) {
          console.log("Reverting legal subscription to free plan");

          // Revert to free legal plan
          const { error } = await supabase
            .from("subscriptions")
            .update({
              legal_plan_id: "free",
              legal_cases_limit: 2,
              legal_documents_limit: 3,
            })
            .eq("stripe_customer_id", subscription.customer as string);

          if (error) {
            console.error("Error reverting legal subscription:", error);
          }
        } else {
          // Revert standard subscription to free plan
          const { error } = await supabase
            .from("subscriptions")
            .update({
              plan_id: "free",
              status: "canceled",
              stripe_subscription_id: null,
              current_period_start: null,
              current_period_end: null,
              cancel_at_period_end: false,
            })
            .eq("stripe_subscription_id", subscription.id);

          if (error) {
            console.error("Error updating subscription:", error);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment failed for invoice:", invoice.id);

        if (invoice.subscription) {
          // Get subscription to check if it's legal
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

          if (isLegalProduct(subscription.metadata)) {
            // For legal subscriptions, we could add specific handling
            // For now, the user keeps access until subscription is deleted
            console.log("Payment failed for legal subscription, user retains access until cancellation");
          } else {
            const { error } = await supabase
              .from("subscriptions")
              .update({ status: "past_due" })
              .eq("stripe_subscription_id", invoice.subscription as string);

            if (error) {
              console.error("Error updating subscription status:", error);
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(`Webhook handler error: ${error.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
