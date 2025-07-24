exports.handleStripeWebhook = async (req, res) => {
  console.log('🔔 [WEBHOOK] Stripe chamado em', new Date().toISOString());
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    console.log('📝 [WEBHOOK] Iniciando verificação de assinatura...');
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('✅ [WEBHOOK] Assinatura verificada. Tipo de evento:', event.type);
  } catch (err) {
    console.error('❌ [WEBHOOK] Erro na verificação da assinatura:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;
  console.log('📦 [WEBHOOK] Dados recebidos do Stripe:', JSON.stringify(data));

  if (event.type === 'checkout.session.completed') {
    const metadata = data.metadata || {};
    const communityId = metadata.communityId;
    const planId = metadata.planId;
    console.log('➡️ [WEBHOOK] Metadata recebida:', metadata);

    if (!communityId || !planId) {
      console.warn('⚠️ [WEBHOOK] Metadata incompleta na sessão de checkout.');
      return res.status(400).send('Metadata incompleta.');
    }

    try {
      const result = await Community.findByIdAndUpdate(communityId, { plan: planId });
      console.log(`✅ [WEBHOOK] Plano ${planId} ativado para comunidade ${communityId}. Resultado:`, result);
    } catch (err) {
      console.error('❌ [WEBHOOK] Erro ao atualizar plano da comunidade:', err);
      return res.status(500).send('Erro interno ao atualizar plano.');
    }

    return res.status(200).send({ received: true });
  }

  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'invoice.payment_failed' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = data;
    const metadata = subscription.metadata || {};
    const communityId = metadata.communityId;
    console.log(`📦 [WEBHOOK] Evento: ${event.type}`);
    console.log('➡️ [WEBHOOK] Metadata na assinatura:', metadata);

    if (!communityId) {
      console.warn('⚠️ [WEBHOOK] Metadata communityId ausente na assinatura.');
      return res.status(200).send({ received: true });
    }

    const status = subscription.status;
    console.log(`🔄 [WEBHOOK] Status da assinatura: ${status} (comunidade: ${communityId})`);

    if (['canceled', 'past_due', 'unpaid'].includes(status)) {
      try {
        const resultPlan = await Community.findByIdAndUpdate(communityId, { plan: null });
        const resultComm = await Communication.updateMany({ communityId }, { active: false });
        console.log(`❌ [WEBHOOK] Plano removido e conexões desativadas para comunidade ${communityId}. Resultados:`, resultPlan, resultComm);
      } catch (err) {
        console.error('❌ [WEBHOOK] Erro ao desativar plano/conexões:', err);
        return res.status(500).send('Erro interno ao remover plano.');
      }
    }
    return res.status(200).send({ received: true });
  }

  console.log(`ℹ️ [WEBHOOK] Evento ignorado: ${event.type}`);
  return res.status(200).send({ received: true });
};
