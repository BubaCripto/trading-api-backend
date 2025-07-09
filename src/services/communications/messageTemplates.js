const formatPrice = (price) => {
  if (price == null) return 'N/A';
  const num = Number(price);
  return num < 0.01 ? `$${num.toFixed(8)}` : `$${num.toFixed(4)}`;
};

const formatPercentage = (value) => {
  if (value == null) return 'N/A';
  return `${Number(value).toFixed(2)}%`;
};

const formatDate = (date) => new Date(date).toLocaleString();

function getSignalColor(signal) {
  return signal === 'LONG' ? '🟢' : '🔴';
}

function formatTargetsList(targets, history = {}) {
  if (!Array.isArray(targets)) return 'Nenhum alvo definido';

  return targets.map((target, index) => {
    const targetHit = history.events?.some(e =>
      e.event === 'Target Hit' && e.target === target
    );
    return `- ALVO ${index + 1}: ${formatPrice(target)} ${targetHit ? '✅' : '⏳'}`;
  }).join('\n');
}

function formatEventHistory(events) {
  if (!Array.isArray(events) || events.length === 0) return 'Nenhum evento registrado';

  return events.map(event =>
    `${formatDate(event.timestamp)}: ${event.event} - ${event.details || event.reason || ''}`
  ).join('\n');
}

function formatMetrics(operation) {
  const metrics = operation.history || {};
  return `
📊 Performance:
- P&L: ${formatPercentage(metrics.pnlPercentage)}
- P&L Amount: ${formatPrice(metrics.pnlAmount)}
- Risk/Reward: ${metrics.riskRewardRatio ? Number(metrics.riskRewardRatio).toFixed(2) : 'N/A'}`;
}

function formatBaseInfo(operation) {
  const color = getSignalColor(operation.signal);
  return `Par: ${operation.pair}
Tipo: ${operation.signal} ${color}
Preço de Entrada: ${formatPrice(operation.entry)}
Stop Loss: ${formatPrice(operation.stop)}`;
}

function formatTradeDetails(operation) {
  return `
📈 Detalhes da Operação:
- Alavancagem: ${operation.leverage}x
- Estratégia: ${operation.strategy || 'N/A'}
- Risco: ${operation.risk || 'N/A'}
- Data/Hora: ${formatDate(operation.date)}`;
}

function newSignal(operation) {
  return `
🚨 NOVA OPERAÇÃO 🚨

${formatBaseInfo(operation)}

🎯 Alvos:
${formatTargetsList(operation.targets, operation.history)}
${formatTradeDetails(operation)}

📝 Descrição:
${operation.description || 'Sem descrição'}

👤 Trader: ${operation.username || 'Anônimo'}`;
}

function entrySignal(operation) {
  return `
🚨 ENTRAMOS NA OPERAÇÃO 🚨

${formatBaseInfo(operation)}

🎯 Alvos:
${formatTargetsList(operation.targets, operation.history)}
${formatTradeDetails(operation)}

📝 Descrição:
${operation.description || 'Sem descrição'}

👤 Trader: ${operation.username || 'Anônimo'}`;
}

function updateSignal(operation) {
  return `
🔄 ATUALIZAÇÃO 🔄

${formatBaseInfo(operation)}

📊 Status dos Alvos:
${formatTargetsList(operation.targets, operation.history)}

${formatMetrics(operation)}

⏰ Histórico de Eventos:
${formatEventHistory(operation.history.events)}

👤 Trader: ${operation.username || 'Anônimo'}`;
}

function stopReachedMessage(operation) {
  return `
⛔ STOP LOSS ATINGIDO ⛔

${formatBaseInfo(operation)}

${formatTradeDetails(operation)}
${formatMetrics(operation)}

⏰ Histórico:
${formatEventHistory(operation.history.events)}

👤 Trader: ${operation.username || 'Anônimo'}`;
}

function closedManualMessage(operation) {
  return `
🔒 FECHAMENTO MANUAL 🔒

${formatBaseInfo(operation)}

📈 Alvos Definidos:
${formatTargetsList(operation.targets, operation.history)}

${formatTradeDetails(operation)}
${formatMetrics(operation)}

⏰ Histórico:
${formatEventHistory(operation.history.events)}

👤 Trader: ${operation.username || 'Anônimo'}`;
}

function cancelledMessage(operation) {
  return `
⚠️ OPERAÇÃO CANCELADA ⚠️

${formatBaseInfo(operation)}

📈 Alvos Planejados:
${formatTargetsList(operation.targets)}
${formatTradeDetails(operation)}

❌ Motivo: ${operation.history?.events?.slice(-1)[0]?.reason || 'Não especificado'}

👤 Trader: ${operation.username || 'Anônimo'}`;
}

module.exports = {
  newSignal,
  entrySignal,
  updateSignal,
  stopReachedMessage,
  closedManualMessage,
  cancelledMessage
};
