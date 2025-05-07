const Operation = require('../models/Operation');
const cryptoApiService = require('./cryptoApiService');
const notificationService = require('./notificationService');

class TradingOperationsService {
  constructor() {
    this.PRICE_THRESHOLD = parseFloat(process.env.PRICE_THRESHOLD) || 0.005;
    this.CHECK_INTERVAL = parseInt(process.env.PRICE_CHECK_INTERVAL) || 15000;
    this.interval = null;
  }

  isTargetHit(operation, currentPrice, target) {
    const isLong = operation.signal === 'LONG';
    const targetHit = isLong ? currentPrice >= target : currentPrice <= target;

    if (targetHit) {
      console.log(`Target hit for ${operation.pair}:
        Current=${currentPrice},
        Target=${target},
        Direction=${operation.signal}`
      );
    }

    return targetHit;
  }

  // Add this method after isTargetHit
isStopHit(operation, currentPrice) {
  const isLong = operation.signal === 'LONG';
  const stopHit = isLong ? currentPrice <= operation.stop : currentPrice >= operation.stop;

  if (stopHit) {
    console.log(`Stop hit for ${operation.pair}:
      Current=${currentPrice},
      Stop=${operation.stop},
      Direction=${operation.signal}`
    );
  }

  return stopHit;
}

  calculateTradeMetrics(operation, exitPrice) {
    const isLong = operation.signal === 'LONG';
    const entryPrice = operation.history.entry || operation.entry;
    const baseCapital = 1000; // Capital base fixo de $1000

    // Calcula P&L
    const priceDiff = exitPrice - entryPrice;
    const direction = isLong ? 1 : -1;
    const pnlPercentage = (direction * priceDiff / entryPrice) * 100 * operation.leverage;
    const leveragedCapital = baseCapital * operation.leverage;
    const pnlAmount = (leveragedCapital * pnlPercentage) / 100;

    // Calcula Risk/Reward
    const risk = Math.abs(entryPrice - operation.stop);
    const reward = Math.abs(exitPrice - entryPrice);
    const riskRewardRatio = reward / risk;

    return {
      pnlPercentage,
      pnlAmount,
      riskRewardRatio
    };
  }

  calculatePriceRange(price) {
    const threshold = price * this.PRICE_THRESHOLD;
    return {
      min: price - threshold,
      max: price + threshold
    };
  }

  // Primeiro, vamos ajustar o isPriceInEntryRange
  isPriceInEntryRange(operation, currentPrice) {
    if (operation.history.isOpen || operation.history.isClosed) {
      return false;
    }
  
    const isLong = operation.signal === 'LONG';
    const entryPrice = operation.entry;
    const threshold = entryPrice * this.PRICE_THRESHOLD;
  
    // Ajuste da lógica para SHORT e LONG
    if (isLong) {
      const upperBound = entryPrice + threshold;
      const lowerBound = entryPrice - threshold;
      const isInRange = currentPrice >= lowerBound && currentPrice <= upperBound;
      
      console.log(`LONG Entry Check - ${operation.pair}:
        Current=${currentPrice},
        Entry=${entryPrice},
        Range=[${lowerBound}-${upperBound}]
        InRange=${isInRange}`);
      
      return isInRange;
    } else {
      const upperBound = entryPrice + threshold;
      const lowerBound = entryPrice - threshold;
      const isInRange = currentPrice >= lowerBound && currentPrice <= upperBound;
      
      console.log(`SHORT Entry Check - ${operation.pair}:
        Current=${currentPrice},
        Entry=${entryPrice},
        Range=[${lowerBound}-${upperBound}]
        InRange=${isInRange}`);
      
      return isInRange;
    }
  }

  async processEntry(operation, currentPrice) {
    if (!this.isPriceInEntryRange(operation, currentPrice)) return false;

    const updates = {
      status: 'Open',
      history: {
        ...operation.history,
        isOpen: true,
        entry: currentPrice,
        isNew: false,  // Corrigido o nome da propriedade
        entryDate: new Date(),
        events: [
          ...(operation.history.events || []),
          {
            event: 'Entry',
            price: currentPrice,
            timestamp: new Date(),
            details: `${operation.signal} position opened at ${currentPrice}`,
            direction: operation.signal  // Adicionado para melhor rastreamento
          }
        ]
      }
    };

    console.log(`Processing ${operation.signal} entry at ${currentPrice} for ${operation.pair}`);

    const updatedOperation = await Operation.findByIdAndUpdate(
      operation._id, 
      updates, 
      { new: true, runValidators: true }  // Adicionado runValidators
    );

    await notificationService.notify('ENTRY', updatedOperation);
    return true;
  }

  async processNew(operation) {
    if (!operation.history.isNew) return false;

    const updates = {
      history: {
        ...operation.history,
        isNew: false,
        events: [
          ...(operation.history.events || []),
          {
            event: 'New',
            price: 0,
            timestamp: new Date(),
            details: `new position`
          }
        ]
      }
    };

    const updatedOperation = await Operation.findByIdAndUpdate(operation._id, updates, { new: false });
    await notificationService.notify('NEW', updatedOperation);
    return true;
  }

  async processTargets(operation, currentPrice) {
    if (!operation.history.isOpen || operation.history.isClosed) return false;

    const unreachedTargets = operation.targets.filter(target =>
      !operation.history.events?.some(h => h.event === 'Target Hit' && h.target === target) &&
      this.isTargetHit(operation, currentPrice, target)
    );

    for (const target of unreachedTargets) {
      const updates = {
        history: {
          ...operation.history,
          events: [
            ...(operation.history.events || []),
            {
              event: 'Target Hit',
              target: target,
              price: currentPrice,
              timestamp: new Date(),
              details: `${operation.signal} position reached target at ${currentPrice}`
            }
          ]
        }
      };

      // Check if ALL targets have been hit
      const hitTargets = [
        ...operation.history.events?.filter(e => e.event === 'Target Hit').map(e => e.target) || [],
        ...unreachedTargets.slice(0, unreachedTargets.indexOf(target) + 1)
      ];

      const allTargetsHit = operation.targets.every(t => hitTargets.includes(t));

      if (allTargetsHit) {
        const metrics = this.calculateTradeMetrics(operation, currentPrice);
        updates.status = 'Closed';
        updates.history = {
          ...updates.history,
          isClosed: true,
          isOpen: false,
          exit: currentPrice,
          exitDate: new Date(),
          allTargetsReached: true,
          pnlPercentage: metrics.pnlPercentage,
          pnlAmount: metrics.pnlAmount,
          riskRewardRatio: metrics.riskRewardRatio,
          events: [
            ...(operation.history.events || []),
            {
              event: 'Target Hit',
              target: target,
              price: currentPrice,
              timestamp: new Date(),
              details: `${operation.signal} position reached all targets at ${currentPrice} (P&L: ${metrics.pnlPercentage.toFixed(2)}%)`
            }
          ]
        };
      }

      const updatedOperation = await Operation.findByIdAndUpdate(operation._id, updates, { new: true });
      await notificationService.notify('TARGET_HIT', updatedOperation);
    }
  }

  async processStopLoss(operation, currentPrice) {
    if (!operation.history.isOpen || operation.history.isClosed || !this.isStopHit(operation, currentPrice)) {
      return false;
    }

    const metrics = this.calculateTradeMetrics(operation, currentPrice);
    const updates = {
      status: 'Closed',
      history: {
        ...operation.history,
        isClosed: true,
        isOpen: false,
        isStop: true,
        stop: true,
        exit: currentPrice,
        exitDate: new Date(),
        pnlPercentage: metrics.pnlPercentage,
        pnlAmount: metrics.pnlAmount,
        riskRewardRatio: metrics.riskRewardRatio,
        events: [
          ...(operation.history.events || []),
          {
            event: 'Stop Loss',
            price: currentPrice,
            timestamp: new Date(),
            details: `${operation.signal} position stopped out at ${currentPrice} (P&L: ${metrics.pnlPercentage.toFixed(2)}%)`
          }
        ]
      }
    };

    const updatedOperation = await Operation.findByIdAndUpdate(operation._id, updates, { new: true });
    await notificationService.notify('STOP_LOSS', updatedOperation);
    return true;
  }

  async processCancellation(operation, currentPrice) {
    if (operation.history.isOpen || operation.history.isClosed) return false;

    const isLong = operation.signal === 'LONG';
    const firstTarget = operation.targets[0];

    if (!firstTarget) return false;

    const upperTargetBound = isLong
      ? firstTarget + firstTarget * this.PRICE_THRESHOLD
      : firstTarget - firstTarget * this.PRICE_THRESHOLD;

    const lowerTargetBound = isLong
      ? firstTarget - firstTarget * this.PRICE_THRESHOLD
      : firstTarget + firstTarget * this.PRICE_THRESHOLD;

    const upperStopBound = operation.stop + operation.stop * this.PRICE_THRESHOLD;
    const lowerStopBound = operation.stop - operation.stop * this.PRICE_THRESHOLD;

    const isNearFirstTarget = currentPrice >= lowerTargetBound && currentPrice <= upperTargetBound;
    const isNearStop = currentPrice <= upperStopBound && currentPrice >= lowerStopBound;

    if (isNearFirstTarget || isNearStop) {
      const reason = isNearStop
        ? `Price (${currentPrice}) too close to stop (${operation.stop})`
        : `Price (${currentPrice}) too close to target (${firstTarget})`;

      const updates = {
        status: 'Cancelled',
        history: {
          ...operation.history,
          isCancelled: true,
          isClosed: true,
          isOpen: false,
          events: [
            ...(operation.history.events || []),
            {
              event: 'Cancelled',
              reason: reason,
              price: currentPrice,
              timestamp: new Date()
            }
          ]
        }
      };

      const updatedOperation = await Operation.findByIdAndUpdate(operation._id, updates, { new: true });
      await notificationService.notify('CANCELLED', updatedOperation);
      return true;
    }

    return false;
  }

  async monitorOperations() {
    try {
      const operations = await Operation.find({
        $or: [
          { status: 'Pending' },
          { 'history.isOpen': true, 'history.isClosed': false }
        ]
      });

      console.log(`Found ${operations.length} active operations to monitor`);
      if (operations.length === 0) return;

      const pairs = [...new Set(operations.map(op => {
        return op.pair.replace('USDT', '').replace('USD', '').replace('/', '');
      }))];
      console.log(`Monitoring prices for pairs: ${pairs.join(', ')}`);

      const prices = await cryptoApiService.getPrices(pairs);
      console.log('Price check summary:');

      for (const operation of operations) {
        const formattedPair = operation.pair.replace('USDT', '').replace('USD', '').replace('/', '');
        const currentPrice = prices[formattedPair]?.USD?.PRICE;

        if (!currentPrice) {
          console.error(`❌ No price found for ${operation.pair} (${formattedPair})`);
          continue;
        }
        console.log(`✓ ${operation.pair}: $${currentPrice} | Status: ${operation.status}`);

        // Substituir verificação de status_signal pela nova flag
        if (operation.history.isManualCloseRequested) {
          console.log(`Processing manual close for ${operation.pair}`);
          await this.processManualClose(operation, currentPrice);
          continue;
        }

        // Fix: Match array elements with destructuring
        const [newResult, entryResult, targetsResult, stopLossResult, cancellationResult] = await Promise.all([
          this.processNew(operation),
          this.processEntry(operation, currentPrice),
          this.processTargets(operation, currentPrice),
          this.processStopLoss(operation, currentPrice),
          this.processCancellation(operation, currentPrice)
        ]);

        if (newResult || entryResult || targetsResult || stopLossResult || cancellationResult) {
          console.log(`Operation ${operation._id} updated:`, {
            new: newResult,
            entry: entryResult,
            targets: targetsResult,
            stopLoss: stopLossResult,
            cancelled: cancellationResult
          });
        }
      }
    } catch (error) {
      console.error('Trading operations monitoring error:', error);
    }
  }

  async processManualClose(operation, currentPrice) {
    if (!operation.history.isOpen || operation.history.isClosed) return false;

    const metrics = this.calculateTradeMetrics(operation, currentPrice);
    const updates = {
      status: 'Closed',
      history: {
        ...operation.history,
        isClosed: true,
        isOpen: false,
        isManualCloseRequested: true,
        exit: currentPrice,
        exitDate: new Date(),
        manualClose: true,
        pnlPercentage: metrics.pnlPercentage,
        pnlAmount: metrics.pnlAmount,
        riskRewardRatio: metrics.riskRewardRatio,
        events: [
          ...(operation.history.events || []),
          {
            event: 'Manual Close',
            price: currentPrice,
            timestamp: new Date(),
            details: `${operation.signal} position manually closed at ${currentPrice} (P&L: ${metrics.pnlPercentage.toFixed(2)}%)`
          }
        ]
      }
    };

    const updatedOperation = await Operation.findByIdAndUpdate(operation._id, updates, { new: true });
    await notificationService.notify('MANUAL_CLOSE', updatedOperation);
    return true;
  }

  start() {
    this.interval = setInterval(() => this.monitorOperations(), this.CHECK_INTERVAL);
    console.log(`Trading operations service started with ${this.CHECK_INTERVAL}ms interval`);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Trading operations service stopped');
    }
  }
}



  module.exports = new TradingOperationsService();




 
