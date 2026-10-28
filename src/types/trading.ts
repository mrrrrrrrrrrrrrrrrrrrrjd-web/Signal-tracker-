export type CurrencyPair =
  | 'USD/BRL'
  | 'USD/JPY'
  | 'AUD/USD'
  | 'EUR/USD'
  | 'EUR/USD (OTC)'
  | 'USD/INR (OTC)'
  | 'USD/PKR (OTC)'
  | 'USD/TRY (OTC)'
  | 'USD/EGP (OTC)'
  | 'USD/IDR (OTC)'
  | 'GBP/USD (OTC)'
  | 'USD/BDT (OTC)'
  | 'GBP/USD'
  | 'USD/CAD'
  | 'EUR/JPY'
  | 'GBP/JPY'
  | 'AUD/JPY'
  | 'NZD/USD'
  | 'USD/CHF'
  | 'EUR/GBP'
  | 'BTC/USD'
  | 'XAU/USD';

export type AssetCategory = 'OTC' | 'FOREX' | 'CROSS' | 'CRYPTO' | 'COMMODITY';

export type SignalDirection = 'CALL' | 'PUT';

export type SignalOutcome = 'PENDING' | 'WIN_DIRECT' | 'WIN_G1' | 'WIN_G2' | 'LOSS';

export interface Candle {
  timestamp: number; // millisecond epoch of candle start (aligned to 60s)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MACDData {
  macdLine: number;
  signalLine: number;
  histogram: number;
  prevHistogram: number;
  momentumStrength: number; // 0 to 100%
  momentumBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  histogramState: 'EXPANDING_BULL' | 'CONTRACTING_BULL' | 'EXPANDING_BEAR' | 'CONTRACTING_BEAR' | 'NEUTRAL';
  crossoverState: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'NONE';
}

export interface IndicatorValues {
  rsi14: number;
  rsi7: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  stochK: number;
  stochD: number;
  ema9: number;
  ema21: number;
  ema50: number;
  macd: MACDData;
  pattern: string;
  trend: 'STRONG_BULL' | 'MILD_BULL' | 'NEUTRAL' | 'MILD_BEAR' | 'STRONG_BEAR';
}

export interface ConfluenceFactor {
  name: string;
  verdict: 'CALL' | 'PUT' | 'NEUTRAL';
  weight: number;
  score: number; // 0 to 100
  detail: string;
}

export interface PredictionSignal {
  id: string;
  pair: CurrencyPair;
  direction: SignalDirection;
  probability: number; // 75 - 96%
  timestamp: number; // time signal was created
  targetCandleTime: number; // start timestamp of the target 1M candle
  entryPrice: number;
  exitPrice?: number;
  outcome: SignalOutcome;
  confluenceScore: number;
  factors: ConfluenceFactor[];
  recommendedStrategy: 'DIRECT' | 'G1' | 'G2';
  payoutPercent: number;
}

export interface PairMarketData {
  pair: CurrencyPair;
  displayName: string;
  currentPrice: number;
  previousClose: number;
  payoutPercent: number;
  candles: Candle[];
  activeSignal: PredictionSignal | null;
  indicators: IndicatorValues;
  confluenceFactors: ConfluenceFactor[];
  overallAccuracy: number;
  directWinRate: number;
  g1WinRate: number;
  totalSignalsTracked: number;
}
