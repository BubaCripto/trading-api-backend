const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewerType: {
    type: String,
    enum: ['COMMUNITY', 'TRADER'],
    required: true
  },
  reviewedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Para TRADER ou pode ser Community para COMMUNITY
    required: true
  },
  reviewedType: {
    type: String,
    enum: ['COMMUNITY', 'TRADER'],
    required: true
  },
  scores: {
    type: mongoose.Schema.Types.Mixed,  // CORRIGIDO AQUI
    required: true,
    validate: {
      validator: function(scores) {
        // Validação diferente dependendo do reviewedType
        if (this.reviewedType === 'TRADER') {
          return (
            'sinais_claros' in scores &&
            'qtd_operacoes' in scores &&
            'estrategias_explicadas' in scores &&
            'resposta_duvidas' in scores
          );
        } else if (this.reviewedType === 'COMMUNITY') {
          return (
            'pagamento_em_dia' in scores &&
            'ambiente_respeitoso' in scores &&
            'reconhecimento_trader' in scores &&
            'comunicacao_clara' in scores
          );
        }
        return false;
      },
      message: 'Scores inválidos para o tipo de avaliação'
    }
  },
  experiencia: {
    type: String,
    trim: true
  },
  melhorar: {
    type: String,
    trim: true
  },
  denuncia: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índice composto para garantir que cada parte só avalie uma vez por contrato
feedbackSchema.index({ contractId: 1, reviewerId: 1, reviewerType: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);