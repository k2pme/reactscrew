import type { ApiInstance, ScrewsMap } from 'reactscrew';

type AssetKind = 'fx' | 'crypto';
type Trend = 'up' | 'down' | 'flat';
type SourceMode = 'live+simulated' | 'simulated-fallback';
type PollSource = 'all' | 'fx' | 'crypto';

interface AssetConfig {
  id: string;
  label: string;
  symbol: string;
  kind: AssetKind;
  accent: string;
  volatility: number;
}

export interface TradingAsset {
  id: string;
  label: string;
  symbol: string;
  kind: AssetKind;
  price: number;
  previousPrice: number;
  changePct: number;
  trend: Trend;
  history: number[];
  high: number;
  low: number;
  accent: string;
  lastUpdated: string;
}

export interface TradingAlert {
  id: string;
  assetId: string;
  assetLabel: string;
  direction: 'up' | 'down';
  severity: 'warning' | 'critical';
  changePct: number;
  price: number;
  acknowledged: boolean;
  createdAt: string;
  message: string;
}

interface JournalEntry {
  id: string;
  tone: 'neutral' | 'bullish' | 'bearish';
  title: string;
  detail: string;
  createdAt: string;
}

interface OverviewPayload {
  assets: TradingAsset[];
  alerts: TradingAlert[];
  journal: JournalEntry[];
  summary: {
    advancing: number;
    declining: number;
    signals: number;
    dominantTone: 'neutral' | 'bullish' | 'bearish';
    sourceMode: SourceMode;
    lastSyncAt: string | null;
    lastWorkflowAt: string | null;
  };
}

const FX_ASSETS: AssetConfig[] = [
  { id: 'eurusd', label: 'Euro / Dollar', symbol: 'EUR/USD', kind: 'fx', accent: '#3dd9b1', volatility: 0.0018 },
  { id: 'usdeur', label: 'Dollar / Euro', symbol: 'USD/EUR', kind: 'fx', accent: '#8fd3ff', volatility: 0.0018 },
];

const CRYPTO_ASSETS: AssetConfig[] = [
  { id: 'bitcoin', label: 'Bitcoin', symbol: 'BTC/USD', kind: 'crypto', accent: '#ffb14a', volatility: 0.012 },
  { id: 'ethereum', label: 'Ethereum', symbol: 'ETH/USD', kind: 'crypto', accent: '#a7afff', volatility: 0.017 },
  { id: 'solana', label: 'Solana', symbol: 'SOL/USD', kind: 'crypto', accent: '#52f2a9', volatility: 0.028 },
  { id: 'cardano', label: 'Cardano', symbol: 'ADA/USD', kind: 'crypto', accent: '#57a1ff', volatility: 0.022 },
];

const ALL_ASSETS = [...FX_ASSETS, ...CRYPTO_ASSETS];
const HISTORY_POINTS = 28;
const ALERT_COOLDOWN_MS = 45_000;

const state: {
  bootstrapped: boolean;
  assets: Record<string, TradingAsset>;
  alerts: TradingAlert[];
  journal: JournalEntry[];
  lastSyncAt: string | null;
  lastWorkflowAt: string | null;
  sourceMode: SourceMode;
  lastAlertAt: Record<string, number>;
} = {
  bootstrapped: false,
  assets: {},
  alerts: [],
  journal: [],
  lastSyncAt: null,
  lastWorkflowAt: null,
  sourceMode: 'live+simulated',
  lastAlertAt: {},
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const nowIso = (): string => new Date().toISOString();

const formatPrice = (value: number, kind: AssetKind): number =>
  Number(value.toFixed(kind === 'fx' ? 5 : value >= 1000 ? 2 : value >= 1 ? 3 : 5));

const jitter = (price: number, intensity: number): number => {
  const drift = (Math.random() - 0.5) * intensity;
  return price * (1 + drift);
};

const buildHistory = (price: number, kind: AssetKind, volatility: number): number[] => {
  const items: number[] = [];
  let cursor = price;
  for (let i = 0; i < HISTORY_POINTS; i += 1) {
    cursor = jitter(cursor, volatility * 0.45);
    items.push(formatPrice(cursor, kind));
  }
  items[items.length - 1] = formatPrice(price, kind);
  return items;
};

const mergeAsset = (config: AssetConfig, price: number): TradingAsset => {
  const existing = state.assets[config.id];
  const nextPrice = formatPrice(price, config.kind);

  if (!existing) {
    const seeded = buildHistory(nextPrice, config.kind, config.volatility);
    const asset: TradingAsset = {
      id: config.id,
      label: config.label,
      symbol: config.symbol,
      kind: config.kind,
      price: nextPrice,
      previousPrice: seeded[seeded.length - 2] ?? nextPrice,
      changePct: 0,
      trend: 'flat',
      history: seeded,
      high: Math.max(...seeded),
      low: Math.min(...seeded),
      accent: config.accent,
      lastUpdated: nowIso(),
    };
    state.assets[config.id] = asset;
    return asset;
  }

  const previousPrice = existing.price;
  const history = [...existing.history.slice(-(HISTORY_POINTS - 1)), nextPrice];
  const changePct = previousPrice === 0 ? 0 : ((nextPrice - previousPrice) / previousPrice) * 100;
  const trend: Trend = changePct > 0.025 ? 'up' : changePct < -0.025 ? 'down' : 'flat';

  const updated: TradingAsset = {
    ...existing,
    price: nextPrice,
    previousPrice,
    changePct: Number(changePct.toFixed(3)),
    trend,
    history,
    high: Math.max(existing.high, nextPrice),
    low: Math.min(existing.low, nextPrice),
    lastUpdated: nowIso(),
  };
  state.assets[config.id] = updated;
  return updated;
};

const ensureJournalSeed = (): void => {
  if (state.journal.length > 0) {
    return;
  }
  state.journal.unshift({
    id: 'session-open',
    tone: 'neutral',
    title: 'Desk prêt',
    detail: 'Les flux publics sont branchés. Les micro-ticks locaux complètent les trous entre deux pulls réseau.',
    createdAt: nowIso(),
  });
};

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on ${url}`);
  }

  return response.json() as Promise<T>;
};

const fetchFx = async (): Promise<void> => {
  const data = await fetchJson<{ rates: { USD: number } }>('https://api.frankfurter.dev/v2/rates?base=EUR&quotes=USD');
  const eurUsd = Number(data.rates.USD);
  mergeAsset(FX_ASSETS[0], eurUsd);
  mergeAsset(FX_ASSETS[1], 1 / eurUsd);
};

const fetchCrypto = async (): Promise<void> => {
  const data = await fetchJson<Record<string, { usd: number }>>(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd'
  );

  for (const config of CRYPTO_ASSETS) {
    const raw = data[config.id]?.usd;
    if (typeof raw === 'number') {
      mergeAsset(config, raw);
    }
  }
};

const simulateTicks = (intensityMultiplier = 1): void => {
  for (const config of ALL_ASSETS) {
    const existing = state.assets[config.id];
    if (!existing) {
      continue;
    }
    const nextPrice = jitter(existing.price, config.volatility * intensityMultiplier);
    mergeAsset(config, nextPrice);
  }
};

const bootstrapMarket = async (): Promise<OverviewPayload> => {
  if (!state.bootstrapped) {
    ensureJournalSeed();
    try {
      await Promise.all([fetchFx(), fetchCrypto()]);
      state.sourceMode = 'live+simulated';
    } catch {
      state.sourceMode = 'simulated-fallback';
      mergeAsset(FX_ASSETS[0], 1.08);
      mergeAsset(FX_ASSETS[1], 0.925);
      mergeAsset(CRYPTO_ASSETS[0], 68_400);
      mergeAsset(CRYPTO_ASSETS[1], 3_650);
      mergeAsset(CRYPTO_ASSETS[2], 172.2);
      mergeAsset(CRYPTO_ASSETS[3], 0.69);
      simulateTicks(0.55);
    }
    state.bootstrapped = true;
    state.lastSyncAt = nowIso();
  }

  return getOverview();
};

const pollMarket = async (source: PollSource): Promise<OverviewPayload> => {
  await bootstrapMarket();

  let liveFailed = false;

  try {
    if (source === 'all' || source === 'fx') {
      await fetchFx();
    }
    if (source === 'all' || source === 'crypto') {
      await fetchCrypto();
    }
    state.sourceMode = 'live+simulated';
  } catch {
    liveFailed = true;
    state.sourceMode = 'simulated-fallback';
  }

  simulateTicks(liveFailed ? 0.75 : 0.24);
  state.lastSyncAt = nowIso();
  return getOverview();
};

const classifyTone = (): 'neutral' | 'bullish' | 'bearish' => {
  const assets = Object.values(state.assets);
  const positive = assets.filter((asset) => asset.changePct > 0.08).length;
  const negative = assets.filter((asset) => asset.changePct < -0.08).length;
  if (positive > negative) {
    return 'bullish';
  }
  if (negative > positive) {
    return 'bearish';
  }
  return 'neutral';
};

const createAlerts = (thresholdPct: number): TradingAlert[] => {
  const created: TradingAlert[] = [];

  for (const asset of Object.values(state.assets)) {
    const magnitude = Math.abs(asset.changePct);
    if (magnitude < thresholdPct) {
      continue;
    }

    const lastAt = state.lastAlertAt[asset.id] ?? 0;
    if (Date.now() - lastAt < ALERT_COOLDOWN_MS) {
      continue;
    }

    const direction = asset.changePct >= 0 ? 'up' : 'down';
    const severity = magnitude >= thresholdPct * 1.8 ? 'critical' : 'warning';
    const alert: TradingAlert = {
      id: `${asset.id}-${Date.now()}`,
      assetId: asset.id,
      assetLabel: asset.label,
      direction,
      severity,
      changePct: Number(asset.changePct.toFixed(3)),
      price: asset.price,
      acknowledged: false,
      createdAt: nowIso(),
      message:
        direction === 'up'
          ? `${asset.symbol} accélère à +${asset.changePct.toFixed(2)}%`
          : `${asset.symbol} décroche à ${asset.changePct.toFixed(2)}%`,
    };

    state.alerts.unshift(alert);
    state.lastAlertAt[asset.id] = Date.now();
    created.push(alert);
  }

  if (created.length > 0) {
    const tone = classifyTone();
    state.journal.unshift({
      id: `journal-${Date.now()}`,
      tone,
      title: created.length > 1 ? `${created.length} signaux publiés` : '1 signal publié',
      detail: created.map((item) => item.message).join(' | '),
      createdAt: nowIso(),
    });
    state.journal = state.journal.slice(0, 12);
  }

  state.alerts = state.alerts.slice(0, 20);
  state.lastWorkflowAt = nowIso();

  return created;
};

const acknowledgeAlert = (id: string): TradingAlert[] => {
  state.alerts = state.alerts.map((alert) =>
    alert.id === id ? { ...alert, acknowledged: true } : alert
  );
  return clone(state.alerts);
};

const getOverview = (): OverviewPayload => {
  const assets = Object.values(state.assets);
  const dominantTone = classifyTone();

  return clone({
    assets,
    alerts: state.alerts,
    journal: state.journal,
    summary: {
      advancing: assets.filter((asset) => asset.changePct > 0).length,
      declining: assets.filter((asset) => asset.changePct < 0).length,
      signals: state.alerts.filter((alert) => !alert.acknowledged).length,
      dominantTone,
      sourceMode: state.sourceMode,
      lastSyncAt: state.lastSyncAt,
      lastWorkflowAt: state.lastWorkflowAt,
    },
  });
};

const matchRoute = (url: string, pattern: RegExp): RegExpExecArray | null => pattern.exec(url);

export const tradingApi: ApiInstance = async ({ method, url, data }) => {
  await new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 220));

  if (method === 'GET' && url === '/market/overview') {
    return { data: await bootstrapMarket(), status: 200, headers: {} };
  }

  if (method === 'GET' && url === '/alerts') {
    await bootstrapMarket();
    return { data: clone(state.alerts), status: 200, headers: {} };
  }

  if (method === 'GET' && url === '/desk/journal') {
    await bootstrapMarket();
    return { data: clone(state.journal), status: 200, headers: {} };
  }

  if (method === 'POST' && url === '/market/bootstrap') {
    return { data: await bootstrapMarket(), status: 200, headers: {} };
  }

  if (method === 'POST' && url === '/market/poll') {
    const source = ((data as { source?: PollSource } | undefined)?.source ?? 'all') as PollSource;
    return { data: await pollMarket(source), status: 200, headers: {} };
  }

  if (method === 'POST' && url === '/market/simulate') {
    await bootstrapMarket();
    const intensity = Number((data as { intensity?: number } | undefined)?.intensity ?? 0.3);
    simulateTicks(intensity);
    state.lastSyncAt = nowIso();
    return { data: getOverview(), status: 200, headers: {} };
  }

  if (method === 'POST' && url === '/market/analyze') {
    await bootstrapMarket();
    const thresholdPct = Number((data as { thresholdPct?: number } | undefined)?.thresholdPct ?? 0.9);
    const created = createAlerts(thresholdPct);
    return {
      data: {
        created,
        createdCount: created.length,
        tone: classifyTone(),
      },
      status: 200,
      headers: {},
    };
  }

  const ackMatch = matchRoute(url, /^\/alerts\/([^/]+)\/ack$/);
  if (method === 'POST' && ackMatch) {
    return { data: acknowledgeAlert(ackMatch[1]), status: 200, headers: {} };
  }

  return { data: null, status: 404, headers: {} };
};

export const tradingScrews: ScrewsMap = {
  market: {
    name: 'market',
    methods: {
      overview: {
        type: 'query',
        route: '/market/overview',
        httpMethod: 'GET',
        staleTime: 1_000,
      },
      bootstrap: {
        type: 'mutation',
        route: '/market/bootstrap',
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'market', methodName: 'overview' },
          { screwName: 'alerts', methodName: 'feed' },
          { screwName: 'desk', methodName: 'journal' },
        ],
      },
      poll: {
        type: 'mutation',
        route: '/market/poll',
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'market', methodName: 'overview' },
          { screwName: 'alerts', methodName: 'feed' },
        ],
      },
      simulate: {
        type: 'mutation',
        route: '/market/simulate',
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'market', methodName: 'overview' },
        ],
      },
      analyze: {
        type: 'mutation',
        route: '/market/analyze',
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'market', methodName: 'overview' },
          { screwName: 'alerts', methodName: 'feed' },
          { screwName: 'desk', methodName: 'journal' },
        ],
      },
    },
  },
  alerts: {
    name: 'alerts',
    methods: {
      feed: {
        type: 'query',
        route: '/alerts',
        httpMethod: 'GET',
        staleTime: 1_000,
      },
      acknowledge: {
        type: 'mutation',
        route: (id: string) => `/alerts/${id}/ack`,
        httpMethod: 'POST',
        invalidateQueries: [
          { screwName: 'alerts', methodName: 'feed' },
          { screwName: 'market', methodName: 'overview' },
        ],
      },
    },
  },
  desk: {
    name: 'desk',
    methods: {
      journal: {
        type: 'query',
        route: '/desk/journal',
        httpMethod: 'GET',
        staleTime: 1_000,
      },
    },
  },
};
