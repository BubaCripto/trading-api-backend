const messageTemplates = require('./communications/messageTemplates');

class MessageFormatterService {
  formatOperationMessage(type, operation = {}) {
    const enrichedOperation = operation;

    switch (type) {
      case 'ENTRY':
        return messageTemplates.entrySignal(enrichedOperation);
      case 'TARGET_HIT':
        return messageTemplates.updateSignal(enrichedOperation);
      case 'STOP_LOSS':
        return messageTemplates.stopReachedMessage(enrichedOperation);
      case 'MANUAL_CLOSE':
        return messageTemplates.closedManualMessage(enrichedOperation);
      case 'CANCELLED':
        return messageTemplates.cancelledMessage(enrichedOperation);
      default:
        return messageTemplates.updateSignal(enrichedOperation);
    }
  }
}
module.exports = new MessageFormatterService();