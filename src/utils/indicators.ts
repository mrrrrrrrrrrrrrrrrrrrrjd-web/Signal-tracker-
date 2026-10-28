import { Candle, ConfluenceFactor, IndicatorValues, MACDData, SignalDirection } from '../types/trading';

// Calculate Moving Average Convergence Divergence (MACD)
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
  latest: MACDData;
} {
  const n = closes.length;
  if (n === 0) {
    const dummy: MACDData = {
      macdLine: 0,
      signalLine: 0,
      histogram: 0,
      prevHistogram: 0,
      momentumStrength: 50,
      momentumBias: 'NEUTRAL',
      histogramState: 'NEUTRAL',
      crossoverState: 'NONE',
    };
    return { macdLine: [], signalLine: [], histogram: [], latest: dummy };
  }

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    macdLine[i] = fastEMA[i] - slowEMA[i];
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    histogram[i] = macdLine[i] - signalLine[i];
  }

  const lastIdx = n - 1;
  const currentMacd = macdLine[lastIdx] || 0;
  const currentSignal = signalLine[lastIdx] || 0;
  const currentHist = histogram[lastIdx] || 0;
  const prevHist = histogram[lastIdx - 1] || 0;

  // Determine crossover
  let crossoverState: MACDData['crossoverState'] = 'NONE';
  if (lastIdx > 0) {
    if (macdLine[lastIdx - 1] <= signalLine[lastIdx - 1] && currentMacd > currentSignal) {
      crossoverState = 'BULLISH_CROSS';
    } else if (macdLine[lastIdx - 1] >= signalLine[lastIdx - 1] && currentMacd < currentSignal) {
      crossoverState = 'BEARISH_CROSS';
    }
  }

  // Determine Histogram Acceleration State
  let histogramState: MACDData['histogramState'] = 'NEUTRAL';
  let momentumBias: MACDData['momentumBias'] = 'NEUTRAL';

  if (currentHist > 0.000001) {
    momentumBias = 'BULLISH';
    histogramState = currentHist >= prevHist ? 'EXPANDING_BULL' : 'CONTRACTING_BULL';
  } else if (currentHist < -0.000001) {
    momentumBias = 'BEARISH';
    histogramState = currentHist <= prevHist ? 'EXPANDING_BEAR' : 'CONTRACTING_BEAR';
  }

  // Calculate normalized strength 0-100%
  const windowCount = Math.min(25, n);
  const histSlice = histogram.slice(Math.max(0, n - windowCount));
  const maxAbsHist = Math.max(...histSlice.map((h) => Math.abs(h)), 0.00001);
  const normalizedHistMagnitude = Math.min(1, Math.abs(currentHist) / maxAbsHist);

  let momentumStrength = Math.round(50 + normalizedHistMagnitude * 40);
  if (histogramState === 'EXPANDING_BULL' || histogramState === 'EXPANDING_BEAR') {
    momentumStrength = Math.min(98, momentumStrength + 8);
  } else if (histogramState === 'CONTRACTING_BULL' || histogramState === 'CONTRACTING_BEAR') {
    momentumStrength = Math.max(35, momentumStrength - 15);
  }
  if (crossoverState !== 'NONE') {
    momentumStrength = Math.min(99, momentumStrength + 10);
  }

  const latest: MACDData = {
    macdLine: currentMacd,
    signalLine: currentSignal,
    histogram: currentHist,
    prevHistogram: prevHist,
    momentumStrength,
    momentumBias,
    histogramState,
    crossoverState,
  };

  return { macdLine, signalLine, histogram, latest };
}

// Calculate Exponential Moving Average
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(prices.length);

  // Initial SMA as base
  let sum = 0;
  const initialCount = Math.min(period, prices.length);
  for (let i = 0; i < initialCount; i++) {
    sum += prices[i];
    emaArray[i] = sum / (i + 1);
  }

  for (let i = initialCount; i < prices.length; i++) {
    emaArray[i] = prices[i] * k + emaArray[i - 1] * (1 - k);
  }

  return emaArray;
}

// Calculate Relative Strength Index
export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length <= period) return new Array(closes.length).fill(50);

  const rsi: number[] = new Array(closes.length).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }

  return rsi;
}

// Calculate Bollinger Bands
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2.0
): { upper: number[]; middle: number[]; lower: number[] } {
  const upper: number[] = new Array(closes.length).fill(closes[0] || 0);
  const middle: number[] = new Array(closes.length).fill(closes[0] || 0);
  const lower: number[] = new Array(closes.length).fill(closes[0] || 0);

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      const slice = closes.slice(0, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      middle[i] = avg;
      upper[i] = avg;
      lower[i] = avg;
      continue;
    }

    const window = closes.slice(i - period + 1, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / period;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    middle[i] = mean;
    upper[i] = mean + stdDevMultiplier * stdDev;
    lower[i] = mean - stdDevMultiplier * stdDev;
  }

  return { upper, middle, lower };
}

// Calculate Stochastic Oscillator (%K and %D)
export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number[]; d: number[] } {
  const kArr: number[] = new Array(candles.length).fill(50);
  const dArr: number[] = new Array(candles.length).fill(50);

  for (let i = 0; i < candles.length; i++) {
    if (i < kPeriod - 1) continue;

    const slice = candles.slice(i - kPeriod + 1, i + 1);
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (const c of slice) {
      if (c.high > highestHigh) highestHigh = c.high;
      if (c.low < lowestLow) lowestLow = c.low;
    }

    const currentClose = candles[i].close;
    const range = highestHigh - lowestLow;
    kArr[i] = range === 0 ? 50 : ((currentClose - lowestLow) / range) * 100;
  }

  // Calculate %D as SMA of %K
  for (let i = 0; i < candles.length; i++) {
    if (i < kPeriod - 1 + dPeriod - 1) {
      dArr[i] = kArr[i];
      continue;
    }
    const dSlice = kArr.slice(i - dPeriod + 1, i + 1);
    dArr[i] = dSlice.reduce((a, b) => a + b, 0) / dPeriod;
  }

  return { k: kArr, d: dArr };
}

// Recognize 1-Minute Candlestick Patterns
export function detectCandlePattern(candles: Candle[]): { pattern: string; bias: 'CALL' | 'PUT' | 'NEUTRAL' } {
  if (candles.length < 3) return { pattern: 'Standard Candle', bias: 'NEUTRAL' };

  const curr = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const prev2 = candles[candles.length - 3];

  const body = Math.abs(curr.close - curr.open);
  const upperWick = curr.high - Math.max(curr.close, curr.open);
  const lowerWick = Math.min(curr.close, curr.open) - curr.low;
  const isGreen = curr.close > curr.open;
  const isRed = curr.close < curr.open;

  const prevBody = Math.abs(prev.close - prev.open);
  const prevIsRed = prev.close < prev.open;
  const prevIsGreen = prev.close > prev.open;

  // 1. Hammer (Long lower wick at support, bullish rejection)
  if (lowerWick >= body * 2 && upperWick <= body * 0.5 && body > 0.00005) {
    return { pattern: 'Bullish Hammer (Support Rejection)', bias: 'CALL' };
  }

  // 2. Shooting Star (Long upper wick at resistance, bearish rejection)
  if (upperWick >= body * 2 && lowerWick <= body * 0.5 && body > 0.00005) {
    return { pattern: 'Shooting Star (Resistance Rejection)', bias: 'PUT' };
  }

  // 3. Bullish Engulfing
  if (isGreen && prevIsRed && curr.open <= prev.close && curr.close >= prev.open && body > prevBody * 1.1) {
    return { pattern: 'Bullish Engulfing', bias: 'CALL' };
  }

  // 4. Bearish Engulfing
  if (isRed && prevIsGreen && curr.open >= prev.close && curr.close <= prev.open && body > prevBody * 1.1) {
    return { pattern: 'Bearish Engulfing', bias: 'PUT' };
  }

  // 5. Pin Bar Reversal
  if (lowerWick > (upperWick + body) * 2) {
    return { pattern: 'Bullish Pin Bar', bias: 'CALL' };
  }
  if (upperWick > (lowerWick + body) * 2) {
    return { pattern: 'Bearish Pin Bar', bias: 'PUT' };
  }

  // 6. Three Consecutive Candles (Momentum Exhaustion / Continuation)
  if (curr.close > curr.open && prev.close > prev.open && prev2.close > prev2.open) {
    return { pattern: 'Three White Soldiers (Trend Momentum)', bias: 'CALL' };
  }
  if (curr.close < curr.open && prev.close < prev.open && prev2.close < prev2.open) {
    return { pattern: 'Three Black Crows (Bearish Momentum)', bias: 'PUT' };
  }

  // 7. Doji Reversal
  if (body <= (upperWick + lowerWick) * 0.15) {
    return { pattern: 'Doji Rejection (Indecision Reversal)', bias: 'NEUTRAL' };
  }

  return { pattern: 'Standard Price Action', bias: 'NEUTRAL' };
}

// Compute Complete Technical Indicators & Confluence Score
export function analyze1MinuteMarket(candles: Candle[]): {
  indicators: IndicatorValues;
  confluenceFactors: ConfluenceFactor[];
  direction: SignalDirection | null;
  probability: number;
} {
  const closes = candles.map((c) => c.close);
  const n = candles.length;
  if (n < 20) {
    return {
      indicators: {
        rsi14: 50,
        rsi7: 50,
        bbUpper: closes[n - 1] || 1,
        bbMiddle: closes[n - 1] || 1,
        bbLower: closes[n - 1] || 1,
        stochK: 50,
        stochD: 50,
        ema9: closes[n - 1] || 1,
        ema21: closes[n - 1] || 1,
        ema50: closes[n - 1] || 1,
        macd: {
          macdLine: 0,
          signalLine: 0,
          histogram: 0,
          prevHistogram: 0,
          momentumStrength: 50,
          momentumBias: 'NEUTRAL',
          histogramState: 'NEUTRAL',
          crossoverState: 'NONE',
        },
        pattern: 'Accumulating Candles',
        trend: 'NEUTRAL',
      },
      confluenceFactors: [],
      direction: null,
      probability: 50,
    };
  }

  const ema9Arr = calculateEMA(closes, 9);
  const ema21Arr = calculateEMA(closes, 21);
  const ema50Arr = calculateEMA(closes, 50);
  const rsi14Arr = calculateRSI(closes, 14);
  const rsi7Arr = calculateRSI(closes, 7);
  const bb = calculateBollingerBands(closes, 20, 2.0);
  const stoch = calculateStochastic(candles, 14, 3);
  const patternResult = detectCandlePattern(candles);
  const macdResult = calculateMACD(closes, 12, 26, 9);

  const lastIdx = n - 1;
  const currentPrice = closes[lastIdx];
  const ema9 = ema9Arr[lastIdx];
  const ema21 = ema21Arr[lastIdx];
  const ema50 = ema50Arr[lastIdx];
  const rsi14 = rsi14Arr[lastIdx];
  const rsi7 = rsi7Arr[lastIdx];
  const bbUpper = bb.upper[lastIdx];
  const bbMiddle = bb.middle[lastIdx];
  const bbLower = bb.lower[lastIdx];
  const stochK = stoch.k[lastIdx];
  const stochD = stoch.d[lastIdx];

  // Determine Trend
  let trend: IndicatorValues['trend'] = 'NEUTRAL';
  if (ema9 > ema21 && ema21 > ema50 && currentPrice > ema9) {
    trend = 'STRONG_BULL';
  } else if (ema9 > ema21) {
    trend = 'MILD_BULL';
  } else if (ema9 < ema21 && ema21 < ema50 && currentPrice < ema9) {
    trend = 'STRONG_BEAR';
  } else if (ema9 < ema21) {
    trend = 'MILD_BEAR';
  }

  // Confluence Evaluation
  const factors: ConfluenceFactor[] = [];
  let callScore = 0;
  let putScore = 0;

  // 1. RSI Factor (Weight: 25)
  if (rsi14 <= 28 || rsi7 <= 20) {
    const score = Math.min(100, Math.round((30 - rsi14) * 4 + 70));
    callScore += 25 * (score / 100);
    factors.push({
      name: 'RSI Reversal (14 & 7)',
      verdict: 'CALL',
      weight: 25,
      score,
      detail: `RSI-14 at ${rsi14.toFixed(1)} & RSI-7 at ${rsi7.toFixed(1)} (Deep Oversold zone, mean-reversion imminent)`,
    });
  } else if (rsi14 >= 72 || rsi7 >= 80) {
    const score = Math.min(100, Math.round((rsi14 - 70) * 4 + 70));
    putScore += 25 * (score / 100);
    factors.push({
      name: 'RSI Reversal (14 & 7)',
      verdict: 'PUT',
      weight: 25,
      score,
      detail: `RSI-14 at ${rsi14.toFixed(1)} & RSI-7 at ${rsi7.toFixed(1)} (Overbought peak, exhaustion expected)`,
    });
  } else if (rsi14 < 45 && rsi14 > 35) {
    factors.push({
      name: 'RSI Zone',
      verdict: 'NEUTRAL',
      weight: 10,
      score: 50,
      detail: `RSI-14 at ${rsi14.toFixed(1)} (Lower neutral zone)`,
    });
  } else {
    factors.push({
      name: 'RSI Zone',
      verdict: 'NEUTRAL',
      weight: 10,
      score: 50,
      detail: `RSI-14 at ${rsi14.toFixed(1)} (Mid-band equilibrium)`,
    });
  }

  // 2. Bollinger Bands Factor (Weight: 25)
  const bbRange = bbUpper - bbLower;
  const distToUpper = bbUpper - currentPrice;
  const distToLower = currentPrice - bbLower;

  if (currentPrice <= bbLower || distToLower < bbRange * 0.08) {
    const score = 88;
    callScore += 25 * (score / 100);
    factors.push({
      name: 'Bollinger Band Squeeze / Rejection',
      verdict: 'CALL',
      weight: 25,
      score,
      detail: `Price touching lower 2.0σ envelope at ${bbLower.toFixed(5)}. Rejection wick detected`,
    });
  } else if (currentPrice >= bbUpper || distToUpper < bbRange * 0.08) {
    const score = 88;
    putScore += 25 * (score / 100);
    factors.push({
      name: 'Bollinger Band Squeeze / Rejection',
      verdict: 'PUT',
      weight: 25,
      score,
      detail: `Price piercing upper 2.0σ envelope at ${bbUpper.toFixed(5)}. Resistance rejection detected`,
    });
  } else {
    factors.push({
      name: 'Bollinger Channel',
      verdict: 'NEUTRAL',
      weight: 10,
      score: 50,
      detail: `Price oscillating within standard band channel`,
    });
  }

  // 3. Stochastic Crossover (Weight: 20)
  if (stochK < 25 && stochK > stochD) {
    const score = 84;
    callScore += 20 * (score / 100);
    factors.push({
      name: 'Stochastic Oscillator (%K/%D)',
      verdict: 'CALL',
      weight: 20,
      score,
      detail: `%K (${stochK.toFixed(1)}) crossed above %D (${stochD.toFixed(1)}) in oversold region (<25)`,
    });
  } else if (stochK > 75 && stochK < stochD) {
    const score = 84;
    putScore += 20 * (score / 100);
    factors.push({
      name: 'Stochastic Oscillator (%K/%D)',
      verdict: 'PUT',
      weight: 20,
      score,
      detail: `%K (${stochK.toFixed(1)}) crossed below %D (${stochD.toFixed(1)}) in overbought region (>75)`,
    });
  } else {
    factors.push({
      name: 'Stochastic Momentum',
      verdict: 'NEUTRAL',
      weight: 10,
      score: 50,
      detail: `Stoch %K: ${stochK.toFixed(1)}, %D: ${stochD.toFixed(1)} in neutral progression`,
    });
  }

  // 4. EMA 9/21 Dynamic Trend & Pullback (Weight: 15)
  if (trend === 'STRONG_BULL' || (trend === 'MILD_BULL' && currentPrice >= ema9)) {
    callScore += 15 * 0.85;
    factors.push({
      name: 'EMA 9 / 21 Trend Ribbon',
      verdict: 'CALL',
      weight: 15,
      score: 85,
      detail: `EMA 9 (${ema9.toFixed(5)}) > EMA 21 (${ema21.toFixed(5)}). Dynamic upward continuation`,
    });
  } else if (trend === 'STRONG_BEAR' || (trend === 'MILD_BEAR' && currentPrice <= ema9)) {
    putScore += 15 * 0.85;
    factors.push({
      name: 'EMA 9 / 21 Trend Ribbon',
      verdict: 'PUT',
      weight: 15,
      score: 85,
      detail: `EMA 9 (${ema9.toFixed(5)}) < EMA 21 (${ema21.toFixed(5)}). Dynamic downward continuation`,
    });
  } else {
    factors.push({
      name: 'EMA Alignment',
      verdict: 'NEUTRAL',
      weight: 10,
      score: 50,
      detail: `EMA ribbon compressing; transitional phase`,
    });
  }

  // 5. Candlestick Price Action (Weight: 15)
  if (patternResult.bias === 'CALL') {
    callScore += 15 * 0.9;
    factors.push({
      name: 'Candlestick Price Action',
      verdict: 'CALL',
      weight: 15,
      score: 90,
      detail: `${patternResult.pattern} formed on active 1-minute close`,
    });
  } else if (patternResult.bias === 'PUT') {
    putScore += 15 * 0.9;
    factors.push({
      name: 'Candlestick Price Action',
      verdict: 'PUT',
      weight: 15,
      score: 90,
      detail: `${patternResult.pattern} formed on active 1-minute close`,
    });
  } else {
    factors.push({
      name: 'Candlestick Formation',
      verdict: 'NEUTRAL',
      weight: 10,
      score: 50,
      detail: patternResult.pattern,
    });
  }

  // 6. MACD Moving Average Convergence Divergence Factor (Weight: 15)
  const macdLatest = macdResult.latest;
  if (macdLatest.momentumBias === 'BULLISH') {
    const isExpanding = macdLatest.histogramState === 'EXPANDING_BULL';
    const isCross = macdLatest.crossoverState === 'BULLISH_CROSS';
    if (isExpanding || isCross) {
      const weightFactor = 15;
      callScore += weightFactor * (macdLatest.momentumStrength / 100);
      factors.push({
        name: 'MACD Momentum Convergence',
        verdict: 'CALL',
        weight: weightFactor,
        score: macdLatest.momentumStrength,
        detail: `MACD ${macdLatest.momentumStrength}% Bullish momentum${isCross ? ' with Bullish Signal Crossover' : isExpanding ? ' (Expanding green histogram)' : ''}`,
      });
    } else {
      factors.push({
        name: 'MACD Momentum',
        verdict: 'NEUTRAL',
        weight: 10,
        score: macdLatest.momentumStrength,
        detail: `Bullish momentum contracting (${macdLatest.momentumStrength}%)`,
      });
    }
  } else if (macdLatest.momentumBias === 'BEARISH') {
    const isExpanding = macdLatest.histogramState === 'EXPANDING_BEAR';
    const isCross = macdLatest.crossoverState === 'BEARISH_CROSS';
    if (isExpanding || isCross) {
      const weightFactor = 15;
      putScore += weightFactor * (macdLatest.momentumStrength / 100);
      factors.push({
        name: 'MACD Momentum Convergence',
        verdict: 'PUT',
        weight: weightFactor,
        score: macdLatest.momentumStrength,
        detail: `MACD ${macdLatest.momentumStrength}% Bearish momentum${isCross ? ' with Bearish Signal Crossover' : isExpanding ? ' (Expanding red histogram)' : ''}`,
      });
    } else {
      factors.push({
        name: 'MACD Momentum',
        verdict: 'NEUTRAL',
        weight: 10,
        score: macdLatest.momentumStrength,
        detail: `Bearish momentum contracting (${macdLatest.momentumStrength}%)`,
      });
    }
  } else {
    factors.push({
      name: 'MACD Momentum',
      verdict: 'NEUTRAL',
      weight: 10,
      score: 50,
      detail: 'MACD at zero line equilibrium',
    });
  }

  // Probability Calculation
  let direction: SignalDirection | null = null;
  let probability = 50;

  // High probability threshold (Quotex binary options requires min ~78% confluence to filter noise)
  if (callScore > putScore && callScore >= 52) {
    direction = 'CALL';
    probability = Math.min(96, Math.max(78, Math.round(76 + (callScore / 100) * 22)));
  } else if (putScore > callScore && putScore >= 52) {
    direction = 'PUT';
    probability = Math.min(96, Math.max(78, Math.round(76 + (putScore / 100) * 22)));
  }

  return {
    indicators: {
      rsi14,
      rsi7,
      bbUpper,
      bbMiddle,
      bbLower,
      stochK,
      stochD,
      ema9,
      ema21,
      ema50,
      macd: macdLatest,
      pattern: patternResult.pattern,
      trend,
    },
    confluenceFactors: factors,
    direction,
    probability,
  };
}

export interface VolatilityMetrics {
  atr14: number;
  atrPercent: number; // ATR as % of current price
  volatilityScore: number; // 0 to 100 normalized
  volatilityLevel: 'ULTRA' | 'HIGH' | 'MODERATE' | 'LOW';
  range1M: number;
  range5M: number;
  range15M: number;
  tickIntensity: number;
  binaryOptionsSuitability: 'OPTIMAL' | 'GOOD' | 'CAUTION' | 'STAGNANT';
}

export function calculateVolatilityMetrics(candles: Candle[], decimals: number): VolatilityMetrics {
  const n = candles.length;
  if (n < 2) {
    return {
      atr14: 0,
      atrPercent: 0,
      volatilityScore: 50,
      volatilityLevel: 'MODERATE',
      range1M: 0,
      range5M: 0,
      range15M: 0,
      tickIntensity: 50,
      binaryOptionsSuitability: 'GOOD',
    };
  }

  // True Ranges
  const trs: number[] = [];
  for (let i = 1; i < n; i++) {
    const curr = candles[i];
    const prev = candles[i - 1];
    const tr = Math.max(
      curr.high - curr.low,
      Math.abs(curr.high - prev.close),
      Math.abs(curr.low - prev.close)
    );
    trs.push(tr);
  }

  const period = Math.min(14, trs.length);
  const recentTRs = trs.slice(-period);
  const atr14 = recentTRs.reduce((a, b) => a + b, 0) / period;

  const currentPrice = candles[n - 1].close;
  const atrPercent = currentPrice > 0 ? (atr14 / currentPrice) * 100 : 0;

  const currCandle = candles[n - 1];
  const range1M = currCandle.high - currCandle.low;

  const last5 = candles.slice(-5);
  const range5M = last5.reduce((acc, c) => acc + (c.high - c.low), 0) / last5.length;

  const last15 = candles.slice(-15);
  const max15 = Math.max(...last15.map((c) => c.high));
  const min15 = Math.min(...last15.map((c) => c.low));
  const range15M = max15 - min15;

  const avgVol = last5.reduce((sum, c) => sum + c.volume, 0) / last5.length;
  const tickIntensity = Math.min(100, Math.round((currCandle.volume / Math.max(1, avgVol)) * 50 + 25));

  // Score normalized across asset classes
  let score = Math.round((atrPercent / 0.055) * 50 + (range1M / (range5M || 0.0001)) * 25);
  score = Math.max(12, Math.min(99, score));

  let volatilityLevel: VolatilityMetrics['volatilityLevel'] = 'MODERATE';
  let binaryOptionsSuitability: VolatilityMetrics['binaryOptionsSuitability'] = 'GOOD';

  if (score >= 80) {
    volatilityLevel = 'ULTRA';
    binaryOptionsSuitability = 'OPTIMAL';
  } else if (score >= 62) {
    volatilityLevel = 'HIGH';
    binaryOptionsSuitability = 'OPTIMAL';
  } else if (score >= 40) {
    volatilityLevel = 'MODERATE';
    binaryOptionsSuitability = 'GOOD';
  } else {
    volatilityLevel = 'LOW';
    binaryOptionsSuitability = 'CAUTION';
  }

  return {
    atr14,
    atrPercent,
    volatilityScore: score,
    volatilityLevel,
    range1M,
    range5M,
    range15M,
    tickIntensity,
    binaryOptionsSuitability,
  };
}
