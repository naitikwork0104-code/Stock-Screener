export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockFundamentals {
  pe: number;
  pb: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  currentRatio: number;
  dividendYield: number;
  eps: number;
  promoterHolding: number;
  revenueGrowth: number;
  profitGrowth: number;
  marketCapCategory: 'Large' | 'Mid' | 'Small' | 'Micro';
}

export interface StockTechnical {
  rsi: number;
  macdSignal: number;
  priceVsSma50: number;
  priceVsSma200: number;
  bollingerPosition: number;
  atr: number;
  volumeVsAverage: number;
  sma50: number;
  sma200: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  sector: string;
  industry: string;
  indices: string[];
  beta: number;
  high52w: number;
  low52w: number;
  high52wPercent: number;
  low52wPercent: number;
  fundamentals: StockFundamentals;
  technical: StockTechnical;
  lastUpdated: string;
}

export interface StockDetail extends Stock {
  description: string;
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'contains';

export type FilterField =
  | 'marketCap'
  | 'pe'
  | 'pb'
  | 'dividendYield'
  | 'eps'
  | 'roe'
  | 'roce'
  | 'debtToEquity'
  | 'currentRatio'
  | 'promoterHolding'
  | 'revenueGrowth'
  | 'profitGrowth'
  | 'price'
  | 'high52wPercent'
  | 'low52wPercent'
  | 'avgVolume'
  | 'beta'
  | 'changePercent'
  | 'sector'
  | 'industry'
  | 'marketCapCategory'
  | 'indices'
  | 'rsi'
  | 'macdSignal'
  | 'priceVsSma50'
  | 'priceVsSma200'
  | 'bollingerPosition'
  | 'atr'
  | 'volumeVsAverage'
  | 'watchlistOnly'
  | 'recentlyUpdated'
  | 'volume';

export interface FilterRule {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string | number | boolean | string[] | [number, number];
  enabled: boolean;
}

export type FilterASTNode =
  | { type: 'rule'; rule: FilterRule }
  | { type: 'and'; children: FilterASTNode[] }
  | { type: 'or'; children: FilterASTNode[] }
  | { type: 'not'; child: FilterASTNode };

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  rules: FilterRule[];
  createdAt: string;
}

export interface SortConfig {
  field: keyof Stock | 'changePercent';
  direction: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: string;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export type IndicatorType = 'SMA' | 'EMA' | 'BOLLINGER' | 'RSI' | 'VOLUME';

export interface ChartIndicator {
  type: IndicatorType;
  period: number;
  enabled: boolean;
  color?: string;
}

export interface SectorInfo {
  name: string;
  count: number;
}

export interface IndexInfo {
  name: string;
  count: number;
}
