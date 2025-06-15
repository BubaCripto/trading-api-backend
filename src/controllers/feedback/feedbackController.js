const feedbackService = require('./feedbackService');

async function createFeedback(req, res, next) {
  try {
    const feedback = await feedbackService.createFeedback(req.body, req.user);
    return res.status(201).json({
      message: 'Feedback enviado com sucesso',
      data: feedback
    });
  } catch (err) {
    next(err);
  }
}

async function getFeedbacksByContract(req, res, next) {
  try {
    const feedbacks = await feedbackService.getFeedbacksByContract(req.params.contractId);
    return res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (err) {
    next(err);
  }
}

async function getFeedbacksByUser(req, res, next) {
  try {
    const feedbacks = await feedbackService.getFeedbacksByUser(req.params.userId);
    return res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createFeedback,
  getFeedbacksByContract,
  getFeedbacksByUser
};