import type { Stock, FilterRule, FilterField } from '@/types';

type Predicate = (stock: Stock, context?: FilterContext) => boolean;

export interface FilterContext {
  watchlist: Set<string>;
  recentlyUpdatedThreshold: number;
}

function compareNumber(
  value: number,
  operator: FilterRule['operator'],
  target: FilterRule['value']
): boolean {
  switch (operator) {
    case 'eq': return value === target;
    case 'neq': return value !== target;
    case 'gt': return value > (target as number);
    case 'gte': return value >= (target as number);
    case 'lt': return value < (target as number);
    case 'lte': return value <= (target as number);
    case 'between': {
      const [min, max] = target as [number, number];
      return value >= min && value <= max;
    }
    default: return true;
  }
}

function compareString(
  value: string,
  operator: FilterRule['operator'],
  target: FilterRule['value']
): boolean {
  switch (operator) {
    case 'eq': return value === target;
    case 'neq': return value !== target;
    case 'contains': return value.toLowerCase().includes(String(target).toLowerCase());
    case 'in': return (target as string[]).includes(value);
    default: return true;
  }
}

function getFieldValue(stock: Stock, field: FilterField): number | string | string[] | boolean {
  switch (field) {
    case 'marketCap': return stock.marketCap;
    case 'pe': return stock.fundamentals.pe;
    case 'pb': return stock.fundamentals.pb;
    case 'dividendYield': return stock.fundamentals.dividendYield;
    case 'eps': return stock.fundamentals.eps;
    case 'roe': return stock.fundamentals.roe;
    case 'roce': return stock.fundamentals.roce;
    case 'debtToEquity': return stock.fundamentals.debtToEquity;
    case 'currentRatio': return stock.fundamentals.currentRatio;
    case 'promoterHolding': return stock.fundamentals.promoterHolding;
    case 'revenueGrowth': return stock.fundamentals.revenueGrowth;
    case 'profitGrowth': return stock.fundamentals.profitGrowth;
    case 'price': return stock.price;
    case 'high52wPercent': return stock.high52wPercent;
    case 'low52wPercent': return stock.low52wPercent;
    case 'avgVolume': return stock.avgVolume;
    case 'beta': return stock.beta;
    case 'changePercent': return stock.changePercent;
    case 'sector': return stock.sector;
    case 'industry': return stock.industry;
    case 'marketCapCategory': return stock.fundamentals.marketCapCategory;
    case 'indices': return stock.indices;
    case 'rsi': return stock.technical.rsi;
    case 'macdSignal': return stock.technical.macdSignal;
    case 'priceVsSma50': return stock.technical.priceVsSma50;
    case 'priceVsSma200': return stock.technical.priceVsSma200;
    case 'bollingerPosition': return stock.technical.bollingerPosition;
    case 'atr': return stock.technical.atr;
    case 'volumeVsAverage': return stock.technical.volumeVsAverage;
    case 'volume': return stock.volume;
    case 'watchlistOnly': return true;
    case 'recentlyUpdated': return true;
    default: return 0;
  }
}

export function createPredicate(rule: FilterRule, context?: FilterContext): Predicate {
  if (!rule.enabled) return () => true;

  return (stock: Stock) => {
    const value = getFieldValue(stock, rule.field);

    if (rule.field === 'watchlistOnly') {
      return context ? context.watchlist.has(stock.symbol) : false;
    }

    if (rule.field === 'recentlyUpdated') {
      if (!context) return false;
      const updated = new Date(stock.lastUpdated).getTime();
      return Date.now() - updated < context.recentlyUpdatedThreshold;
    }

    if (rule.field === 'indices') {
      if (rule.operator === 'in') {
        return (rule.value as string[]).some((idx) => (value as string[]).includes(idx));
      }
      return compareString((value as string[])[0] ?? '', rule.operator, rule.value);
    }

    if (typeof value === 'number') {
      return compareNumber(value, rule.operator, rule.value);
    }

    return compareString(String(value), rule.operator, rule.value);
  };
}

export const FILTER_FIELD_LABELS: Record<FilterField, string> = {
  marketCap: 'Market Cap',
  pe: 'P/E Ratio',
  pb: 'P/B Ratio',
  dividendYield: 'Dividend Yield',
  eps: 'EPS',
  roe: 'ROE',
  roce: 'ROCE',
  debtToEquity: 'Debt/Equity',
  currentRatio: 'Current Ratio',
  promoterHolding: 'Promoter Holding',
  revenueGrowth: 'Revenue Growth',
  profitGrowth: 'Profit Growth',
  price: 'Price',
  high52wPercent: '52W High %',
  low52wPercent: '52W Low %',
  avgVolume: 'Avg Volume',
  beta: 'Beta',
  changePercent: 'Day Change %',
  sector: 'Sector',
  industry: 'Industry',
  marketCapCategory: 'Market Cap Category',
  indices: 'Index Membership',
  rsi: 'RSI',
  macdSignal: 'MACD Signal',
  priceVsSma50: 'Price vs SMA50',
  priceVsSma200: 'Price vs SMA200',
  bollingerPosition: 'Bollinger Position',
  atr: 'ATR',
  volumeVsAverage: 'Volume vs Average',
  watchlistOnly: 'Watchlist Only',
  recentlyUpdated: 'Recently Updated',
  volume: 'Volume',
};

export const ALL_FILTER_FIELDS: FilterField[] = Object.keys(FILTER_FIELD_LABELS) as FilterField[];
