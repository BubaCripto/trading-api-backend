require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const Community = require('../../models/Community');
const Communication = require('../../models/Communication');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  if (event.type === 'checkout.session.completed') {
    const communityId = data.metadata.communityId;
    const planId = data.metadata.planId;

    console.log(`✅ Pagamento bem-sucedido para comunidade: ${communityId}`);

    await Community.findByIdAndUpdate(communityId, { plan: planId });

    return res.status(200).send({ received: true });
  }

  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'invoice.payment_failed' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = data;

    const communityId = subscription.metadata?.communityId;

    if (!communityId) {
      console.error('⚠️ communityId não encontrado no metadata');
      return res.status(400).send('communityId não encontrado');
    }

    const status = subscription.status;
    console.log(`⚠️ Status da assinatura alterado: ${status} para comunidade: ${communityId}`);

    if (['canceled', 'past_due', 'unpaid'].includes(status)) {
      // 🔥 Remove o plano e desativa as conexões
      await Community.findByIdAndUpdate(communityId, { plan: null });

      await Communication.updateMany(
        { communityId: communityId },
        { active: false }
      );

      console.log(`❌ Plano removido e conexões desativadas para comunidade ${communityId}`);
    }
  }

  res.status(200).send({ received: true });
};
