require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const Community = require('../../models/Community');
const Communication = require('../../models/Communication');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Verificação de assinatura
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);



  } catch (err) {
    console.error('❌ Erro na verificação da assinatura do webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  // ✅ TRATAMENTO: Pagamento bem-sucedido (criação da assinatura)
  if (event.type === 'checkout.session.completed') {
    const metadata = data.metadata || {};
    const communityId = metadata.communityId;
    const planId = metadata.planId;

    console.log('📦 Evento: checkout.session.completed');
    console.log('➡️ Metadata recebida:', metadata);

    if (!communityId || !planId) {
      console.warn('⚠️ Metadata incompleta na sessão de checkout.');
      return res.status(400).send('Metadata incompleta.');
    }

    try {
      await Community.findByIdAndUpdate(communityId, { plan: planId });
      console.log(`✅ Plano ${planId} ativado para comunidade ${communityId}`);
    } catch (err) {
      console.error('❌ Erro ao atualizar plano da comunidade:', err);
      return res.status(500).send('Erro interno ao atualizar plano.');
    }

    return res.status(200).send({ received: true });
  }

  // ❌ TRATAMENTO: Assinatura cancelada ou falha de pagamento
  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'invoice.payment_failed' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = data;
    const metadata = subscription.metadata || {};
    const communityId = metadata.communityId;

    console.log(`📦 Evento: ${event.type}`);
    console.log('➡️ Metadata na assinatura:', metadata);

    if (!communityId) {
      console.warn('⚠️ Metadata communityId ausente na assinatura.');
      return res.status(200).send({ received: true });
    }

    const status = subscription.status;
    console.log(`🔄 Status da assinatura: ${status} (comunidade: ${communityId})`);

    if (['canceled', 'past_due', 'unpaid'].includes(status)) {
      try {
        await Community.findByIdAndUpdate(communityId, { plan: null });
        await Communication.updateMany({ communityId }, { active: false });
        console.log(`❌ Plano removido e conexões desativadas para comunidade ${communityId}`);
      } catch (err) {
        console.error('❌ Erro ao desativar plano/conexões:', err);
        return res.status(500).send('Erro interno ao remover plano.');
      }
    }

    return res.status(200).send({ received: true });
  }

  // Outros eventos
  console.log(`ℹ️ Evento ignorado: ${event.type}`);
  return res.status(200).send({ received: true });
};
