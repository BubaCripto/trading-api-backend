Aqui está o modelo de dados necessário para implementar a Dashboard da Comunidade:

📊 Modelo de Dados para Dashboard da Comunidade
1. CommunityStats (Estatísticas Gerais)

interface CommunityStats {
  _id: string;
  communityId: string;
  totalSignalsReceived: number;      // Total de sinais recebidos
  activeSignals: number;             // Sinais ainda ativos/abertos
  closedSignals: number;             // Sinais fechados
  successfulSignals: number;         // Sinais que deram lucro
  successRate: number;               // Taxa de sucesso (%)
  totalPnl: number;                  // PnL total da comunidade
  averageSignalDuration: number;     // Duração média dos sinais (em dias)
  contractedTraders: number;         // Número de traders contratados
  totalMembers: number;              // Total de membros na comunidade
  activeMembers: number;             // Membros ativos
  updatedAt: Date;
}
2. CommunitySignal (Sinais Recebidos)

interface CommunitySignal {
  _id: string;
  communityId: string;
  traderId: string;                  // ID do trader que enviou o sinal
  traderName: string;                // Nome do trader
  pair: string;                      // Par negociado (ex: BTC/USDT)
  signal: "LONG" | "SHORT";          // Tipo do sinal
  leverage: number;                  // Alavancagem
  strategy: string;                  // Estratégia utilizada
  risk: "LOW" | "MEDIUM" | "HIGH";   // Nível de risco
  entry: number;                     // Preço de entrada
  stop: number;                      // Stop loss
  targets: number[];                 // Alvos de lucro
  description: string;               // Descrição do sinal
  status: "ACTIVE" | "CLOSED" | "STOPPED"; // Status do sinal

  // Dados de performance
  currentPrice?: number;             // Preço atual
  pnlPercentage?: number;           // PnL em percentual
  pnlAmount?: number;               // PnL em valor absoluto

  // Datas
  sentAt: Date;                     // Data que o sinal foi enviado
  entryDate?: Date;                 // Data de entrada
  exitDate?: Date;                  // Data de saída

  // Histórico
  history: SignalHistory;
}
3. SignalHistory (Histórico do Sinal)

interface SignalHistory {
  isActive: boolean;
  isClosed: boolean;
  isStop: boolean;
  entry?: number;
  exit?: number;
  pnlPercentage?: number;
  pnlAmount?: number;
  entryDate?: Date;
  exitDate?: Date;
  events: SignalEvent[];
}

interface SignalEvent {
  event: string;                    // Tipo do evento
  price?: number;                   // Preço no momento do evento
  target?: number;                  // Alvo atingido (se aplicável)
  reason?: string;                  // Motivo do evento
  timestamp: Date;                  // Data/hora do evento
  details?: string;                 // Detalhes adicionais
}
4. CommunityPerformance (Performance da Comunidade)

interface CommunityPerformance {
  _id: string;
  communityId: string;
  date: Date;                       // Data da performance
  totalPnl: number;                 // PnL acumulado até esta data
  dailyPnl: number;                 // PnL do dia
  signalsCount: number;             // Número de sinais no dia
  successfulSignals: number;        // Sinais bem-sucedidos no dia
  successRate: number;              // Taxa de sucesso do dia
}
5. CommunityTrader (Traders da Comunidade)

interface CommunityTrader {
  _id: string;
  communityId: string;
  traderId: string;
  traderName: string;
  contractStatus: "ACTIVE" | "PENDING" | "INACTIVE";
  totalSignalsSent: number;         // Total de sinais enviados
  successfulSignals: number;       // Sinais bem-sucedidos
  successRate: number;             // Taxa de sucesso do trader
  totalPnl: number;                // PnL total gerado pelo trader
  contractStartDate: Date;         // Data de início do contrato
  contractEndDate?: Date;          // Data de fim do contrato (se houver)
}
🛠️ Endpoints da API Necessários
Para Dashboard da Comunidade:
GET /api/communities/{id}/stats - Estatísticas gerais
GET /api/communities/{id}/signals - Sinais recebidos (com paginação)
GET /api/communities/{id}/performance - Dados de performance para gráficos
GET /api/communities/{id}/traders - Lista de traders contratados
Exemplo de Response para Stats:

{
  "success": true,
  "data": {
    "_id": "...",
    "communityId": "6823f132b985691a444cf0ba",
    "totalSignalsReceived": 45,
    "activeSignals": 8,
    "closedSignals": 37,
    "successfulSignals": 28,
    "successRate": 75.68,
    "totalPnl": 12540.50,
    "averageSignalDuration": 3.2,
    "contractedTraders": 3,
    "totalMembers": 150,
    "activeMembers": 89,
    "updatedAt": "2025-07-09T16:45:00Z"
  }
}
📈 Observações Importantes
Diferenciação: A comunidade vê "sinais" enquanto o trader vê "operações"
Permissões: Comunidade só vê dados dos traders contratados
Agregação: Os dados precisam ser agregados de múltiplos traders
Tempo Real: Considere WebSockets para atualizações em tempo real
Cache: Implemente cache para estatísticas que não mudam frequentemente
Esse modelo permitirá que sua API forneça todos os dados necessários para a Dashboard da Comunidade funcionar corretamente, mantendo a separação de responsabilidades entre traders e comunidades.

Plano para Implementar o Modelo de Dados da Dashboard da Comunidade:

Criar schemas/modelos no backend

CommunityStats para estatísticas gerais
CommunitySignal para sinais recebidos
SignalHistory para histórico de sinais
CommunityPerformance para dados de performance
CommunityTrader para traders contratados
Implementar endpoints da API

GET /api/communities/{id}/stats - estatísticas gerais
GET /api/communities/{id}/signals - sinais com paginação
GET /api/communities/{id}/performance - dados para gráficos
GET /api/communities/{id}/traders - traders contratados
Criar serviços de agregação

Agregador de dados de múltiplos traders
Calculador de estatísticas da comunidade
Sistema de cache para performance
Implementar lógica de negócio

Permissões (comunidade só vê traders contratados)
Conversão de "operações" para "sinais"
Cálculos de PnL e taxa de sucesso
Testar integração

Verificar se Dashboard carrega dados corretos
Validar cálculos de estatísticas
Testar performance com múltiplos traders
