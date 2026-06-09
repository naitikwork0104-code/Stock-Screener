export const STOCK_COUNT = 5200;
export const TRADING_DAYS = 260;

export const SECTORS = [
  'Technology', 'Healthcare', 'Financials', 'Consumer Discretionary',
  'Consumer Staples', 'Industrials', 'Energy', 'Materials',
  'Utilities', 'Real Estate', 'Communication Services',
] as const;

export const INDUSTRIES: Record<string, string[]> = {
  Technology: ['Software', 'Semiconductors', 'Hardware', 'IT Services', 'Cloud Computing'],
  Healthcare: ['Pharmaceuticals', 'Biotechnology', 'Medical Devices', 'Healthcare Services'],
  Financials: ['Banks', 'Insurance', 'Asset Management', 'Fintech'],
  'Consumer Discretionary': ['Retail', 'Automotive', 'Leisure', 'E-Commerce'],
  'Consumer Staples': ['Food & Beverage', 'Household Products', 'Personal Care'],
  Industrials: ['Aerospace', 'Machinery', 'Transportation', 'Defense'],
  Energy: ['Oil & Gas', 'Renewables', 'Utilities Energy'],
  Materials: ['Chemicals', 'Mining', 'Steel', 'Paper'],
  Utilities: ['Electric', 'Gas', 'Water'],
  'Real Estate': ['REITs', 'Commercial', 'Residential'],
  'Communication Services': ['Media', 'Telecom', 'Entertainment'],
};

export const INDICES = [
  'S&P 500', 'NASDAQ 100', 'Dow Jones', 'Russell 2000',
  'NIFTY 50', 'SENSEX', 'FTSE 100', 'DAX',
] as const;

export const MARKET_CAP_CATEGORIES = ['Large', 'Mid', 'Small', 'Micro'] as const;

export const COMPANY_PREFIXES = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Nova', 'Apex', 'Prime',
  'Global', 'United', 'National', 'Pacific', 'Atlantic', 'Summit', 'Vertex',
  'Quantum', 'Stellar', 'Horizon', 'Pioneer', 'Catalyst', 'Fusion', 'Nexus',
];

export const COMPANY_SUFFIXES = [
  'Corp', 'Inc', 'Ltd', 'Group', 'Holdings', 'Systems', 'Technologies',
  'Solutions', 'Industries', 'Enterprises', 'Partners', 'Dynamics',
];
