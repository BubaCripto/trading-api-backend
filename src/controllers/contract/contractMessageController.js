const contractMessageService = require('./contractMessageService');

async function sendMessage(req, res, next) {
  try {
    const contractId = req.params.id;
    const { message } = req.body;

    const newMessage = await contractMessageService.sendMessage(
      { contractId, message },
      req.user
    );

    return res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
}

async function getMessagesByContract(req, res, next) {
  try {
    const contractId = req.params.id;

    const messages = await contractMessageService.getMessagesByContract(
      contractId,
      req.user
    );

    return res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
}

async function markMessageAsRead(req, res, next) {
  try {
    const messageId = req.params.messageId;

    const updated = await contractMessageService.markMessageAsRead(
      messageId,
      req.user
    );

    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendMessage,
  getMessagesByContract,
  markMessageAsRead,
};
