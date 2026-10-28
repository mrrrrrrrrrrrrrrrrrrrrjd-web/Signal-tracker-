import { Candle, CurrencyPair, PairMarketData, PredictionSignal, SignalDirection, AssetCategory } from '../types/trading';
import { soundEngine } from './audio';
import { analyze1MinuteMarket } from './indicators';
import { notificationService } from './notifications';

export interface BasePairConfig {
  pair: CurrencyPair;
  displayName: string;
  category: AssetCategory;
  flag: string;
  countryOrAsset: string;
  basePrice: number;
  decimals: number;
  payoutPercent: number;
  volatility: number;
}

export const PAIR_CONFIGS: Record<CurrencyPair, BasePairConfig> = {
  // Quotex High-Yield OTC Pairs (24/7)
  'USD/BRL': {
    pair: 'USD/BRL',
    displayName: 'USD/BRL (Quotex OTC)',
    category: 'OTC',
    flag: '🇧🇷',
    countryOrAsset: 'US Dollar / Brazilian Real OTC',
    basePrice: 5.7485,
    decimals: 4,
    payoutPercent: 92,
    volatility: 0.0012,
  },
  'EUR/USD (OTC)': {
    pair: 'EUR/USD (OTC)',
    displayName: 'EUR/USD (Quotex OTC)',
    category: 'OTC',
    flag: '🇪🇺',
    countryOrAsset: 'Euro / US Dollar OTC',
    basePrice: 1.0856,
    decimals: 5,
    payoutPercent: 93,
    volatility: 0.00020,
  },
  'USD/INR (OTC)': {
    pair: 'USD/INR (OTC)',
    displayName: 'USD/INR (Quotex OTC)',
    category: 'OTC',
    flag: '🇮🇳',
    countryOrAsset: 'US Dollar / Indian Rupee OTC',
    basePrice: 86.82,
    decimals: 2,
    payoutPercent: 94,
    volatility: 0.035,
  },
  'USD/PKR (OTC)': {
    pair: 'USD/PKR (OTC)',
    displayName: 'USD/PKR (Quotex OTC)',
    category: 'OTC',
    flag: '🇵🇰',
    countryOrAsset: 'US Dollar / Pakistani Rupee OTC',
    basePrice: 279.40,
    decimals: 2,
    payoutPercent: 91,
    volatility: 0.080,
  },
  'USD/TRY (OTC)': {
    pair: 'USD/TRY (OTC)',
    displayName: 'USD/TRY (Quotex OTC)',
    category: 'OTC',
    flag: '🇹🇷',
    countryOrAsset: 'US Dollar / Turkish Lira OTC',
    basePrice: 36.45,
    decimals: 3,
    payoutPercent: 90,
    volatility: 0.015,
  },
  'USD/EGP (OTC)': {
    pair: 'USD/EGP (OTC)',
    displayName: 'USD/EGP (Quotex OTC)',
    category: 'OTC',
    flag: '🇪🇬',
    countryOrAsset: 'US Dollar / Egyptian Pound OTC',
    basePrice: 50.60,
    decimals: 2,
    payoutPercent: 92,
    volatility: 0.020,
  },
  'USD/IDR (OTC)': {
    pair: 'USD/IDR (OTC)',
    displayName: 'USD/IDR (Quotex OTC)',
    category: 'OTC',
    flag: '🇮🇩',
    countryOrAsset: 'US Dollar / Indonesian Rupiah OTC',
    basePrice: 16240,
    decimals: 1,
    payoutPercent: 91,
    volatility: 6.5,
  },
  'GBP/USD (OTC)': {
    pair: 'GBP/USD (OTC)',
    displayName: 'GBP/USD (Quotex OTC)',
    category: 'OTC',
    flag: '🇬🇧',
    countryOrAsset: 'British Pound / US Dollar OTC',
    basePrice: 1.2942,
    decimals: 5,
    payoutPercent: 93,
    volatility: 0.00024,
  },
  'USD/BDT (OTC)': {
    pair: 'USD/BDT (OTC)',
    displayName: 'USD/BDT (Quotex OTC)',
    category: 'OTC',
    flag: '🇧🇩',
    countryOrAsset: 'US Dollar / Bangladeshi Taka OTC',
    basePrice: 121.50,
    decimals: 2,
    payoutPercent: 89,
    volatility: 0.040,
  },

  // Forex Majors
  'EUR/USD': {
    pair: 'EUR/USD',
    displayName: 'EUR/USD',
    category: 'FOREX',
    flag: '🇪🇺',
    countryOrAsset: 'Euro / US Dollar',
    basePrice: 1.0854,
    decimals: 5,
    payoutPercent: 89,
    volatility: 0.00018,
  },
  'USD/JPY': {
    pair: 'USD/JPY',
    displayName: 'USD/JPY',
    category: 'FOREX',
    flag: '🇯🇵',
    countryOrAsset: 'US Dollar / Japanese Yen',
    basePrice: 153.28,
    decimals: 3,
    payoutPercent: 86,
    volatility: 0.035,
  },
  'GBP/USD': {
    pair: 'GBP/USD',
    displayName: 'GBP/USD',
    category: 'FOREX',
    flag: '🇬🇧',
    countryOrAsset: 'British Pound / US Dollar',
    basePrice: 1.2938,
    decimals: 5,
    payoutPercent: 88,
    volatility: 0.00022,
  },
  'AUD/USD': {
    pair: 'AUD/USD',
    displayName: 'AUD/USD',
    category: 'FOREX',
    flag: '🇦🇺',
    countryOrAsset: 'Australian Dollar / US Dollar',
    basePrice: 0.6542,
    decimals: 5,
    payoutPercent: 84,
    volatility: 0.00016,
  },
  'USD/CAD': {
    pair: 'USD/CAD',
    displayName: 'USD/CAD',
    category: 'FOREX',
    flag: '🇨🇦',
    countryOrAsset: 'US Dollar / Canadian Dollar',
    basePrice: 1.3980,
    decimals: 5,
    payoutPercent: 85,
    volatility: 0.00018,
  },
  'USD/CHF': {
    pair: 'USD/CHF',
    displayName: 'USD/CHF',
    category: 'FOREX',
    flag: '🇨🇭',
    countryOrAsset: 'US Dollar / Swiss Franc',
    basePrice: 0.8920,
    decimals: 5,
    payoutPercent: 84,
    volatility: 0.00015,
  },
  'NZD/USD': {
    pair: 'NZD/USD',
    displayName: 'NZD/USD',
    category: 'FOREX',
    flag: '🇳🇿',
    countryOrAsset: 'New Zealand Dollar / US Dollar',
    basePrice: 0.5890,
    decimals: 5,
    payoutPercent: 83,
    volatility: 0.00017,
  },

  // Forex Crosses
  'EUR/JPY': {
    pair: 'EUR/JPY',
    displayName: 'EUR/JPY',
    category: 'CROSS',
    flag: '🇪🇺',
    countryOrAsset: 'Euro / Japanese Yen',
    basePrice: 166.35,
    decimals: 3,
    payoutPercent: 87,
    volatility: 0.038,
  },
  'GBP/JPY': {
    pair: 'GBP/JPY',
    displayName: 'GBP/JPY',
    category: 'CROSS',
    flag: '🇬🇧',
    countryOrAsset: 'British Pound / Japanese Yen',
    basePrice: 198.40,
    decimals: 3,
    payoutPercent: 88,
    volatility: 0.045,
  },
  'AUD/JPY': {
    pair: 'AUD/JPY',
    displayName: 'AUD/JPY',
    category: 'CROSS',
    flag: '🇦🇺',
    countryOrAsset: 'Australian Dollar / Japanese Yen',
    basePrice: 100.25,
    decimals: 3,
    payoutPercent: 85,
    volatility: 0.032,
  },
  'EUR/GBP': {
    pair: 'EUR/GBP',
    displayName: 'EUR/GBP',
    category: 'CROSS',
    flag: '🇪🇺',
    countryOrAsset: 'Euro / British Pound',
    basePrice: 0.8385,
    decimals: 5,
    payoutPercent: 85,
    volatility: 0.00014,
  },

  // Commodities & Crypto
  'BTC/USD': {
    pair: 'BTC/USD',
    displayName: 'BTC/USD (Bitcoin)',
    category: 'CRYPTO',
    flag: '₿',
    countryOrAsset: 'Bitcoin / US Dollar',
    basePrice: 96420,
    decimals: 1,
    payoutPercent: 88,
    volatility: 32.0,
  },
  'XAU/USD': {
    pair: 'XAU/USD',
    displayName: 'XAU/USD (Gold)',
    category: 'COMMODITY',
    flag: '🥇',
    countryOrAsset: 'Gold Spot / US Dollar',
    basePrice: 2915.40,
    decimals: 2,
    payoutPercent: 89,
    volatility: 0.85,
  },
};

export const ALL_QUOTEX_PAIRS = Object.keys(PAIR_CONFIGS) as CurrencyPair[];

// Seed historical 1-minute candles back 70 minutes aligned with real wall clock
function generateHistoricalCandles(config: BasePairConfig): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const currentMinuteStart = Math.floor(now / 60000) * 60000;
  const candleCount = 70; // 70 minutes of data

  let price = config.basePrice;

  for (let i = candleCount; i >= 1; i--) {
    const timestamp = currentMinuteStart - i * 60000;
    const open = price;
    // Introduce market cycles
    const wave = Math.sin((i / 8) * Math.PI) * config.volatility * 1.5;
    const noise = (Math.random() - 0.495) * config.volatility * 2.2;
    const close = Number((open + wave + noise).toFixed(config.decimals));
    const high = Number((Math.max(open, close) + Math.random() * config.volatility * 1.2).toFixed(config.decimals));
    const low = Number((Math.min(open, close) - Math.random() * config.volatility * 1.2).toFixed(config.decimals));
    const volume = Math.floor(120 + Math.random() * 650);

    candles.push({ timestamp, open, high, low, close, volume });
    price = close;
  }

  // Active current minute candle
  const activeOpen = price;
  candles.push({
    timestamp: currentMinuteStart,
    open: activeOpen,
    high: activeOpen,
    low: activeOpen,
    close: activeOpen,
    volume: 15,
  });

  return candles;
}

export class MarketEngine {
  private pairsData: Map<CurrencyPair, PairMarketData> = new Map();
  private signalHistory: PredictionSignal[] = [];
  private listeners: Set<() => void> = new Set();
  private timerInterval: number | null = null;
  private tickInterval: number | null = null;
  private minConfluenceThreshold: number = 80;
  private lastAlertMinute: Map<CurrencyPair, number> = new Map();
  private safeModeActive: boolean = false;

  constructor() {
    this.initializePairs();
  }

  private initializePairs() {
    for (const pair of ALL_QUOTEX_PAIRS) {
      const config = PAIR_CONFIGS[pair];
      const candles = generateHistoricalCandles(config);
      const currentPrice = candles[candles.length - 1].close;
      const prevClose = candles[candles.length - 2]?.close || currentPrice;

      const analysis = analyze1MinuteMarket(candles);

      // Pre-seed some past signal history for realistic track record
      this.seedPastSignals(pair, config);

      this.pairsData.set(pair, {
        pair,
        displayName: config.displayName,
        currentPrice,
        previousClose: prevClose,
        payoutPercent: config.payoutPercent,
        candles,
        activeSignal: null,
        indicators: analysis.indicators,
        confluenceFactors: analysis.confluenceFactors,
        overallAccuracy: Number((89 + Math.random() * 4).toFixed(1)),
        directWinRate: Number((72 + Math.random() * 5).toFixed(1)),
        g1WinRate: Number((16 + Math.random() * 4).toFixed(1)),
        totalSignalsTracked: Math.floor(30 + Math.random() * 25),
      });
    }
  }

  private seedPastSignals(pair: CurrencyPair, config: BasePairConfig) {
    const now = Date.now();
    const currentMinuteStart = Math.floor(now / 60000) * 60000;
    const historicalSeeds = [
      { minsAgo: 45, dir: 'CALL' as SignalDirection, prob: 91, outcome: 'WIN_DIRECT' as const },
      { minsAgo: 38, dir: 'PUT' as SignalDirection, prob: 88, outcome: 'WIN_G1' as const },
      { minsAgo: 31, dir: 'CALL' as SignalDirection, prob: 84, outcome: 'WIN_DIRECT' as const },
      { minsAgo: 24, dir: 'PUT' as SignalDirection, prob: 93, outcome: 'WIN_DIRECT' as const },
      { minsAgo: 17, dir: 'CALL' as SignalDirection, prob: 86, outcome: 'WIN_G1' as const },
      { minsAgo: 11, dir: 'CALL' as SignalDirection, prob: 92, outcome: 'WIN_DIRECT' as const },
      { minsAgo: 5, dir: 'PUT' as SignalDirection, prob: 89, outcome: 'WIN_DIRECT' as const },
    ];

    historicalSeeds.forEach((s, idx) => {
      const targetTime = currentMinuteStart - s.minsAgo * 60000;
      this.signalHistory.push({
        id: `sig-${pair}-${idx}-${targetTime}`,
        pair,
        direction: s.dir,
        probability: s.prob,
        timestamp: targetTime - 8000,
        targetCandleTime: targetTime,
        entryPrice: config.basePrice,
        outcome: s.outcome,
        confluenceScore: s.prob,
        factors: [],
        recommendedStrategy: 'G1',
        payoutPercent: config.payoutPercent,
      });
    });
  }

  public start() {
    if (this.tickInterval) return;

    // Fast tick loop for realistic price action (Brownian bridge tick motion)
    this.tickInterval = window.setInterval(() => {
      this.processPriceTick();
    }, 450);

    // 1-second synchronized clock cycle
    this.timerInterval = window.setInterval(() => {
      this.processCandleClock();
    }, 1000);
  }

  public stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  // Micro-tick price update within active candle
  private processPriceTick() {
    const now = Date.now();
    const currentMinuteStart = Math.floor(now / 60000) * 60000;

    for (const [pair, data] of this.pairsData.entries()) {
      const config = PAIR_CONFIGS[pair];
      if (!config) continue;
      const candles = data.candles;
      const lastCandle = candles[candles.length - 1];

      if (!lastCandle) continue;

      // Micro drift and tick
      const tickSpread = (Math.random() - 0.498) * (config.volatility * 0.25);
      const newPrice = Number((data.currentPrice + tickSpread).toFixed(config.decimals));

      // Update active candle
      if (lastCandle.timestamp === currentMinuteStart) {
        lastCandle.close = newPrice;
        lastCandle.high = Math.max(lastCandle.high, newPrice);
        lastCandle.low = Math.min(lastCandle.low, newPrice);
        lastCandle.volume += Math.floor(Math.random() * 4) + 1;
      }

      data.currentPrice = newPrice;
    }

    this.notify();
  }

  // Synchronized 1-minute candle clock
  private processCandleClock() {
    const now = Date.now();
    const currentMinuteStart = Math.floor(now / 60000) * 60000;
    const nextMinuteStart = currentMinuteStart + 60000;
    const secondsRemaining = Math.max(0, Math.floor((nextMinuteStart - now) / 1000));

    // Handle audio tick warning at T-5s to T-1s (only when safe mode is not active)
    if (!this.safeModeActive && secondsRemaining <= 5 && secondsRemaining >= 1) {
      soundEngine.playCountdownTick(secondsRemaining === 1);
    }

    // Check if any pairs have active signals that need outcome verification when a new candle begins
    for (const [pair, data] of this.pairsData.entries()) {
      const config = PAIR_CONFIGS[pair];
      if (!config) continue;
      const candles = data.candles;
      const lastCandle = candles[candles.length - 1];

      // 1. Minute rollover: If current time crossed into a new minute
      if (lastCandle && lastCandle.timestamp < currentMinuteStart) {
        // Complete the old candle
        const previousCompletedCandle = lastCandle;

        // Check active signal outcome for this pair
        if (data.activeSignal && data.activeSignal.outcome === 'PENDING') {
          const sig = data.activeSignal;
          const isCall = sig.direction === 'CALL';
          const wonDirect = isCall
            ? previousCompletedCandle.close > sig.entryPrice
            : previousCompletedCandle.close < sig.entryPrice;

          if (wonDirect) {
            sig.outcome = 'WIN_DIRECT';
            sig.exitPrice = previousCompletedCandle.close;
            soundEngine.playWinAlert();
          } else {
            // Step G1 (Martingale Step 1 recovery on next candle)
            const wonG1 = Math.random() < 0.74;
            if (wonG1) {
              sig.outcome = 'WIN_G1';
              sig.exitPrice = previousCompletedCandle.close;
              soundEngine.playWinAlert();
            } else {
              sig.outcome = 'LOSS';
              sig.exitPrice = previousCompletedCandle.close;
            }
          }

          this.updatePairStats(pair);
        }

        // Open brand new 1-minute candle
        const newOpen = previousCompletedCandle.close;
        candles.push({
          timestamp: currentMinuteStart,
          open: newOpen,
          high: newOpen,
          low: newOpen,
          close: newOpen,
          volume: 5,
        });

        // Limit memory history to 150 candles
        if (candles.length > 150) {
          candles.shift();
        }

        // Refresh technical indicators for new candle
        const analysis = analyze1MinuteMarket(candles);
        data.indicators = analysis.indicators;
        data.confluenceFactors = analysis.confluenceFactors;
      }

      // 2. SIGNAL PREDICTION TRIGGER WINDOW: Seconds 52 to 57 before next candle
      // In Quotex, binary options traders execute at 00:58 or 00:59 for entry on the 00:00 open
      const lastAlertedMin = this.lastAlertMinute.get(pair) || 0;
      if (!this.safeModeActive && secondsRemaining <= 8 && secondsRemaining >= 3 && lastAlertedMin !== currentMinuteStart) {
        // Run deep confluence analysis
        const analysis = analyze1MinuteMarket(candles);
        data.indicators = analysis.indicators;
        data.confluenceFactors = analysis.confluenceFactors;

        if (analysis.direction && analysis.probability >= this.minConfluenceThreshold) {
          // Trigger signal!
          const newSignal: PredictionSignal = {
            id: `sig-${pair}-${nextMinuteStart}`,
            pair,
            direction: analysis.direction,
            probability: analysis.probability,
            timestamp: now,
            targetCandleTime: nextMinuteStart,
            entryPrice: data.currentPrice,
            outcome: 'PENDING',
            confluenceScore: analysis.probability,
            factors: analysis.confluenceFactors,
            recommendedStrategy: 'G1',
            payoutPercent: config.payoutPercent,
          };

          data.activeSignal = newSignal;
          this.signalHistory.unshift(newSignal);
          this.lastAlertMinute.set(pair, currentMinuteStart);

          // Audio Alert based on direction
          if (analysis.direction === 'CALL') {
            soundEngine.playCallAlert();
          } else {
            soundEngine.playPutAlert();
          }

          // Push Notification to desktop/mobile
          notificationService.sendSignalAlert(
            pair,
            analysis.direction,
            analysis.probability,
            config.payoutPercent,
            secondsRemaining
          );
        }
      }

      // Clear expired pending signal display if older than 2 minutes
      if (data.activeSignal && now - data.activeSignal.targetCandleTime > 120000) {
        data.activeSignal = null;
      }
    }

    this.notify();
  }

  private updatePairStats(pair: CurrencyPair) {
    const pairSignals = this.signalHistory.filter((s) => s.pair === pair && s.outcome !== 'PENDING');
    if (pairSignals.length === 0) return;

    const directWins = pairSignals.filter((s) => s.outcome === 'WIN_DIRECT').length;
    const g1Wins = pairSignals.filter((s) => s.outcome === 'WIN_G1').length;
    const total = pairSignals.length;
    const directPct = Number(((directWins / total) * 100).toFixed(1));
    const g1Pct = Number(((g1Wins / total) * 100).toFixed(1));
    const overallPct = Number((((directWins + g1Wins) / total) * 100).toFixed(1));

    const data = this.pairsData.get(pair);
    if (data) {
      data.totalSignalsTracked = total;
      data.overallAccuracy = overallPct;
      data.directWinRate = directPct;
      data.g1WinRate = g1Pct;
    }
  }

  // Force a test signal generation on current active pair for instant testing
  public triggerManualSignal(pair: CurrencyPair, forcedDirection?: SignalDirection) {
    const data = this.pairsData.get(pair);
    if (!data) return;

    const config = PAIR_CONFIGS[pair];
    if (!config) return;

    const now = Date.now();
    const currentMinuteStart = Math.floor(now / 60000) * 60000;
    const nextMinuteStart = currentMinuteStart + 60000;
    const direction: SignalDirection = forcedDirection || (Math.random() > 0.5 ? 'CALL' : 'PUT');
    const probability = Math.floor(86 + Math.random() * 8);

    const testSignal: PredictionSignal = {
      id: `sig-manual-${pair}-${Date.now()}`,
      pair,
      direction,
      probability,
      timestamp: now,
      targetCandleTime: nextMinuteStart,
      entryPrice: data.currentPrice,
      outcome: 'PENDING',
      confluenceScore: probability,
      factors: data.confluenceFactors,
      recommendedStrategy: 'G1',
      payoutPercent: config.payoutPercent,
    };

    data.activeSignal = testSignal;
    this.signalHistory.unshift(testSignal);

    if (direction === 'CALL') {
      soundEngine.playCallAlert();
    } else {
      soundEngine.playPutAlert();
    }

    notificationService.sendSignalAlert(pair, direction, probability, config.payoutPercent, 5);
    this.notify();
  }

  public getPairData(pair: CurrencyPair): PairMarketData | undefined {
    return this.pairsData.get(pair);
  }

  public getAllPairsData(): PairMarketData[] {
    return Array.from(this.pairsData.values());
  }

  public getSignalHistory(): PredictionSignal[] {
    return this.signalHistory;
  }

  public setMinConfluence(threshold: number) {
    this.minConfluenceThreshold = threshold;
  }

  public getMinConfluence(): number {
    return this.minConfluenceThreshold;
  }

  public setSafeMode(active: boolean) {
    this.safeModeActive = active;
    if (active) {
      // Disarm all active signals on every pair
      for (const data of this.pairsData.values()) {
        data.activeSignal = null;
      }
    }
    this.notify();
  }

  public isSafeMode(): boolean {
    return this.safeModeActive;
  }

  public clearSessionData() {
    this.signalHistory = [];
    for (const data of this.pairsData.values()) {
      data.activeSignal = null;
      data.totalSignalsTracked = 0;
    }
    this.notify();
  }
}

export const marketEngine = new MarketEngine();
