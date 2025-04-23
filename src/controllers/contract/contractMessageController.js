const contractMessageService = require('./contractMessageService');


async function sendMessage(req, res) {
  try {
    const contractId = req.params.id;
    const { message } = req.body;
    const newMessage = await contractMessageService.sendMessage({ contractId, message }, req.user);
    return res.status(201).json(newMessage);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function getMessagesByContract(req, res) {
  try {
    const contractId = req.params.id;
    const messages = await contractMessageService.getMessagesByContract(contractId, req.user);
    return res.status(200).json(messages);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function markMessageAsRead(req, res) {
  try {
    const messageId = req.params.messageId;
    const updated = await contractMessageService.markMessageAsRead(messageId, req.user);
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = {
  sendMessage,
  getMessagesByContract,
  markMessageAsRead
};
