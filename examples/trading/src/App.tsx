import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import {
  ScrewDevtools,
  type WorkflowConfig,
  useScrewBatch,
  useScrewMutation,
  useScrewQuery,
  useScrewToast,
  useScrewWorkflow,
} from 'reactscrew';
import type { TradingAlert, TradingAsset } from './marketApi';

type TabId = 'desk' | 'realtime' | 'heatmap' | 'signals';
type CandlePoint = {
  time: UTCTimestamp;
  open: number;
  close: number;
  high: number;
  low: number;
};
type StepHandlerMode = 'none' | 'toast' | 'console' | 'toast+sound';
type ErrorHandlerMode = 'stop' | 'toast-stop' | 'continue' | 'toast-continue';

const tabs: { id: TabId; label: string }[] = [
  { id: 'desk', label: 'Trading Desk' },
  { id: 'realtime', label: 'Temps réel' },
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'signals', label: 'Signals' },
];

const thresholdOptions = [0.25, 0.5, 0.9, 1.2];
const zoomOptions = [8, 12, 18, 27];

const pct = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

const money = (asset: TradingAsset): string => {
  if (asset.kind === 'fx') {
    return asset.price.toFixed(5);
  }
  return asset.price >= 1000
    ? asset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : asset.price.toLocaleString('en-US', { maximumFractionDigits: 4 });
};

const Sparkline = ({ points, color }: { points: number[]; color: string }) => {
  const width = 140;
  const height = 54;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const d = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

const buildCandles = (asset: TradingAsset): CandlePoint[] => {
  const base = Math.floor(Date.now() / 1000) - asset.history.length * 60;
  return asset.history.slice(1).map((price, index) => {
    const open = asset.history[index];
    const close = price;
    const spread = Math.abs(close - open);
    const baseWick = Math.max(spread * 0.7, asset.kind === 'fx' ? 0.00018 : Math.max(close * 0.0025, 0.02));
    const high = Math.max(open, close) + baseWick * (0.45 + (index % 3) * 0.18);
    const low = Math.min(open, close) - baseWick * (0.3 + (index % 4) * 0.16);

    return {
      time: (base + index * 60) as UTCTimestamp,
      open,
      close,
      high,
      low,
    };
  });
};

const RealtimeChart = ({
  asset,
  zoom,
}: {
  asset: TradingAsset;
  zoom: number;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick', Time, CandlestickData<Time>, CandlestickData<Time>> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height: 560,
      layout: {
        background: { type: ColorType.Solid, color: '#08171f' },
        textColor: '#c5dde9',
        fontFamily: 'IBM Plex Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.07)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.12)',
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.12)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#3dd9b1',
      downColor: '#ff6262',
      borderVisible: false,
      wickUpColor: '#3dd9b1',
      wickDownColor: '#ff6262',
      priceLineVisible: true,
      lastValueVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const observer = new ResizeObserver(() => {
      chart.timeScale().fitContent();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      seriesRef.current = null;
      chartRef.current = null;
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) {
      return;
    }

    const candles = buildCandles(asset);
    seriesRef.current.setData(candles);
    chartRef.current.timeScale().fitContent();
    const from = Math.max(candles.length - zoom - 0.5, 0);
    const to = candles.length + 0.5;
    chartRef.current.timeScale().setVisibleLogicalRange({ from, to });
  }, [asset, zoom]);

  return <div ref={containerRef} className="realtime-chart-host" />;
};

const useBell = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  return () => {
    if (typeof window === 'undefined') {
      return;
    }

    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      return;
    }

    const ctx = audioContextRef.current ?? new Ctx();
    audioContextRef.current = ctx;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(660, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(990, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('desk');
  const [thresholdPct, setThresholdPct] = useState(0.9);
  const [confirmationMultiplier, setConfirmationMultiplier] = useState(1.65);
  const [workflowRetry, setWorkflowRetry] = useState(0);
  const [workflowRetryDelay, setWorkflowRetryDelay] = useState(900);
  const [workflowContinueOnError, setWorkflowContinueOnError] = useState(true);
  const [workflowStepHandler, setWorkflowStepHandler] = useState<StepHandlerMode>('toast');
  const [workflowErrorHandler, setWorkflowErrorHandler] = useState<ErrorHandlerMode>('toast-continue');
  const [autoSweep, setAutoSweep] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDevtools, setShowDevtools] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(12);

  const { addToast } = useScrewToast();
  const ringBell = useBell();

  const overview = useScrewQuery<{
    assets: TradingAsset[];
    alerts: TradingAlert[];
    journal: { id: string; tone: string; title: string; detail: string; createdAt: string }[];
    summary: {
      advancing: number;
      declining: number;
      signals: number;
      dominantTone: 'neutral' | 'bullish' | 'bearish';
      sourceMode: 'live+simulated' | 'simulated-fallback';
      lastSyncAt: string | null;
      lastWorkflowAt: string | null;
    };
  }>('market', 'overview', { staleTime: 1_000 });

  const alerts = useScrewQuery<TradingAlert[]>('alerts', 'feed', { staleTime: 1_000 });
  const journal = useScrewQuery<{ id: string; tone: string; title: string; detail: string; createdAt: string }[]>(
    'desk',
    'journal',
    { staleTime: 1_000 }
  );

  const bootstrap = useScrewMutation('market', 'bootstrap');
  const simulate = useScrewMutation('market', 'simulate');
  const acknowledge = useScrewMutation('alerts', 'acknowledge');

  const batch = useScrewBatch();
  const lastAlertIdRef = useRef<string | null>(null);

  const assets = overview.data?.assets ?? [];
  const hero = assets[0] ?? null;
  const gainers = useMemo(() => [...assets].sort((a, b) => b.changePct - a.changePct), [assets]);
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? hero ?? null,
    [assets, selectedAssetId, hero]
  );

  useEffect(() => {
    if (!selectedAssetId && hero) {
      setSelectedAssetId(hero.id);
      return;
    }

    if (selectedAssetId && !assets.some((asset) => asset.id === selectedAssetId) && hero) {
      setSelectedAssetId(hero.id);
    }
  }, [selectedAssetId, assets, hero]);

  const workflowConfig = useMemo<WorkflowConfig>(() => ({
    steps: [
      {
        id: 'analyse-market',
        screwName: 'market',
        methodName: 'analyze',
        label: 'Analyse des seuils',
        retry: workflowRetry,
        retryDelay: workflowRetryDelay,
        continueOnError: workflowContinueOnError,
        variables: { thresholdPct },
      },
      {
        id: 'confirm-publication',
        screwName: 'market',
        methodName: 'analyze',
        label: 'Confirmation des signaux',
        dependsOn: ['analyse-market'],
        retry: workflowRetry,
        retryDelay: workflowRetryDelay,
        continueOnError: workflowContinueOnError,
        variables: { thresholdPct: Number((thresholdPct * confirmationMultiplier).toFixed(2)) },
      },
    ],
    onStepComplete: async (step) => {
      if (step.status !== 'success') {
        return;
      }

      if (workflowStepHandler === 'console') {
        console.info('workflow:step:success', step.id, step.label);
        return;
      }

      if (workflowStepHandler === 'toast' || workflowStepHandler === 'toast+sound') {
        addToast({
          variant: 'info',
          message: `${step.label} terminé.`,
        });
      }

      if (workflowStepHandler === 'toast+sound' && soundEnabled) {
        ringBell();
      }
    },
    onStepError: async (error, step) => {
      if (workflowErrorHandler === 'toast-stop' || workflowErrorHandler === 'toast-continue') {
        addToast({
          variant: 'error',
          message: `${step.label} a échoué: ${error.message}`,
        });
      }

      return workflowErrorHandler === 'continue' || workflowErrorHandler === 'toast-continue';
    },
  }), [
    workflowRetry,
    workflowRetryDelay,
    workflowContinueOnError,
    thresholdPct,
    confirmationMultiplier,
    workflowStepHandler,
    workflowErrorHandler,
    addToast,
    soundEnabled,
    ringBell,
  ]);

  const workflow = useScrewWorkflow(workflowConfig);

  const runSurveillance = async () => {
    const result = await workflow.execute();

    if (result.status === 'completed') {
      addToast({
        variant: 'success',
        message: 'Workflow de surveillance exécuté.',
      });
    } else if (result.status === 'partial') {
      addToast({
        variant: 'warning',
        message: 'Workflow partiel. Le seuil n’a pas généré tous les signaux attendus.',
      });
    }

    return result;
  };

  const runSweep = async () => {
    await batch.execute([
      { screwName: 'market', methodName: 'poll', label: 'Flux FX', variables: { source: 'fx' } },
      { screwName: 'market', methodName: 'poll', label: 'Flux Crypto', variables: { source: 'crypto' } },
      { screwName: 'market', methodName: 'simulate', label: 'Micro ticks', variables: { intensity: 0.18 } },
    ]);
    await runSurveillance();
  };

  useEffect(() => {
    void bootstrap.mutate()
      .then(() => runSweep())
      .catch(() => {
        addToast({
          variant: 'error',
          message: 'Bootstrap trading indisponible. Le mode simulé sera utilisé si possible.',
        });
      });
  }, []);

  useEffect(() => {
    if (!autoSweep) {
      return;
    }

    const timer = window.setInterval(() => {
      void runSweep().catch(() => {
        addToast({
          variant: 'warning',
          message: 'Sweep échoué. Nouveau passage au prochain cycle.',
        });
      });
    }, 20_000);

    return () => window.clearInterval(timer);
  }, [autoSweep, thresholdPct]);

  useEffect(() => {
    const latest = alerts.data?.find((item) => !item.acknowledged);
    if (!latest || latest.id === lastAlertIdRef.current) {
      return;
    }

    lastAlertIdRef.current = latest.id;

    addToast({
      variant: latest.severity === 'critical' ? 'error' : 'warning',
      message: latest.message,
    });

    if (soundEnabled) {
      ringBell();
    }
  }, [alerts.data, soundEnabled]);

  useEffect(() => {
    if (activeTab !== 'realtime') {
      return;
    }

    const timer = window.setInterval(() => {
      void simulate.mutate({ intensity: 0.11 }).catch(() => undefined);
    }, 2_500);

    return () => window.clearInterval(timer);
  }, [activeTab]);

  const toneClass = overview.data?.summary.dominantTone ?? 'neutral';

  if (activeTab === 'realtime' && selectedAsset) {
    return (
      <div className={`trading-shell realtime-shell tone-${toneClass}`}>
        <div className="orb orb-a" />
        <div className="orb orb-b" />

        <section className="realtime-page">
          <header className="realtime-page-head">
            <div>
              <p className="eyebrow">ReactScrew Trading Example</p>
              <h1>Page temps réel plein écran.</h1>
              <p className="lede">
                `lightweight-charts` gère ici le zoom, le pan et la lecture des chandeliers. Le flux continue de pulser tant que cette page est ouverte.
              </p>
            </div>

            <div className="tab-row">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-chip ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          <section className="realtime-stage">
            <div className="realtime-stage-top">
              <div className="realtime-hero">
                <div className="realtime-price">{money(selectedAsset)}</div>
                <div className={`hero-delta ${selectedAsset.trend}`}>{selectedAsset.symbol} {pct(selectedAsset.changePct)}</div>
                <div className="hero-meta">
                  <span>{selectedAsset.label}</span>
                  <span>{new Date(selectedAsset.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="realtime-toolbar">
                <label className="select-wrap">
                  <span>Devise</span>
                  <select value={selectedAsset.id} onChange={(e) => setSelectedAssetId(e.target.value)}>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.symbol}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="select-wrap">
                  <span>Zoom</span>
                  <select value={zoomLevel} onChange={(e) => setZoomLevel(Number(e.target.value))}>
                    {zoomOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} bougies
                      </option>
                    ))}
                  </select>
                </label>

                <button className="ghost-btn" onClick={() => void simulate.mutate({ intensity: 0.28 })}>
                  Tick forcé
                </button>
                <button className="ghost-btn" onClick={() => setAutoSweep((value) => !value)}>
                  {autoSweep ? 'Auto sweep actif' : 'Auto sweep coupé'}
                </button>
              </div>
            </div>

            <div className="realtime-chart-panel">
              <RealtimeChart asset={selectedAsset} zoom={zoomLevel} />
            </div>

            <div className="realtime-bottom">
              <div className="realtime-stats">
                <div>
                  <span>High</span>
                  <strong>{money({ ...selectedAsset, price: selectedAsset.high })}</strong>
                </div>
                <div>
                  <span>Low</span>
                  <strong>{money({ ...selectedAsset, price: selectedAsset.low })}</strong>
                </div>
                <div>
                  <span>Source</span>
                  <strong>{overview.data?.summary.sourceMode === 'live+simulated' ? 'Live + sim' : 'Sim fallback'}</strong>
                </div>
              </div>

              <div className="watchlist watchlist-inline">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    className={`watch-item ${asset.id === selectedAsset.id ? 'active' : ''} ${asset.trend}`}
                    onClick={() => setSelectedAssetId(asset.id)}
                  >
                    <span>{asset.symbol}</span>
                    <strong>{pct(asset.changePct)}</strong>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }

  return (
    <div className={`trading-shell tone-${toneClass}`}>
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      <header className="hero">
        <div>
          <p className="eyebrow">ReactScrew Trading Example</p>
          <h1>Desk de trading multi-vues avec batch, workflow et alertes.</h1>
          <p className="lede">
            Les cours FX viennent de Frankfurter, les cryptos de CoinGecko, puis des micro-ticks locaux prolongent le flux entre deux refreshs.
          </p>
        </div>

        <div className="hero-panel">
          <div className="hero-price">{hero ? money(hero) : '...'}</div>
          <div className={`hero-delta ${hero?.trend ?? 'flat'}`}>
            {hero ? `${hero.symbol} ${pct(hero.changePct)}` : 'Chargement du lead market'}
          </div>
          <div className="hero-meta">
            <span>{overview.data?.summary.sourceMode === 'live+simulated' ? 'Live seed + simulation' : 'Simulation fallback'}</span>
            <span>{overview.data?.summary.lastSyncAt ? new Date(overview.data.summary.lastSyncAt).toLocaleTimeString() : 'synchronisation...'}</span>
          </div>
        </div>
      </header>

      <section className="control-bar">
        <div className="tab-row">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-chip ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="actions">
          <label className="select-wrap">
            <span>Seuil</span>
            <select value={thresholdPct} onChange={(e) => setThresholdPct(Number(e.target.value))}>
              {thresholdOptions.map((option) => (
                <option key={option} value={option}>
                  {option}%
                </option>
              ))}
            </select>
          </label>

          <button className="ghost-btn" onClick={() => setAutoSweep((value) => !value)}>
            {autoSweep ? 'Auto sweep actif' : 'Auto sweep coupé'}
          </button>
          <button className="ghost-btn" onClick={() => setSoundEnabled((value) => !value)}>
            {soundEnabled ? 'Signal sonore on' : 'Signal sonore off'}
          </button>
          <button className="primary-btn" onClick={() => void runSweep()} disabled={batch.isExecuting || workflow.isExecuting}>
            {batch.isExecuting ? 'Sweep en cours...' : 'Sweep batch'}
          </button>
          <button className="ghost-btn" onClick={() => void runSurveillance()} disabled={workflow.isExecuting}>
            {workflow.isExecuting ? 'Workflow...' : 'Workflow'}
          </button>
          <button className="ghost-btn" onClick={() => void simulate.mutate({ intensity: 0.85 })}>
            Shock test
          </button>
          <button className="ghost-btn" onClick={() => setShowDevtools((value) => !value)}>
            {showDevtools ? 'Masquer devtools' : 'Voir devtools'}
          </button>
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <span className="metric-label">Advancing</span>
          <strong>{overview.data?.summary.advancing ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Declining</span>
          <strong>{overview.data?.summary.declining ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Signaux ouverts</span>
          <strong>{overview.data?.summary.signals ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Workflow</span>
          <strong>{overview.data?.summary.lastWorkflowAt ? new Date(overview.data.summary.lastWorkflowAt).toLocaleTimeString() : 'pas encore'}</strong>
        </article>
      </section>

      {activeTab === 'desk' && (
        <section className="desk-grid">
          <div className="panel panel-large">
            <div className="panel-head">
              <h2>Market board</h2>
              <span>{assets.length} instruments</span>
            </div>
            <div className="asset-grid">
              {assets.map((asset) => (
                <article key={asset.id} className={`asset-card ${asset.trend}`}>
                  <div className="asset-top">
                    <div>
                      <p>{asset.label}</p>
                      <strong>{asset.symbol}</strong>
                    </div>
                    <span className={`pill ${asset.kind}`}>{asset.kind}</span>
                  </div>
                  <div className="asset-price">{money(asset)}</div>
                  <div className={`asset-change ${asset.trend}`}>{pct(asset.changePct)}</div>
                  <Sparkline points={asset.history} color={asset.accent} />
                </article>
              ))}
            </div>
          </div>

          <div className="stack">
            <div className="panel">
              <div className="panel-head">
                <h2>Batch</h2>
                <span>{batch.progress ? `${batch.progress.itemsProcessed}/${batch.progress.itemsTotal}` : 'idle'}</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${batch.progress?.percentage ?? 0}%` }} />
              </div>
              <p className="muted">Le batch orchestre les pulls FX, crypto et les micro-ticks.</p>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Workflow</h2>
                <span>{workflow.result?.status ?? 'idle'}</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar workflow" style={{ width: `${workflow.progress?.percentage ?? 0}%` }} />
              </div>
              <div className="step-list">
                {(workflow.result?.steps ?? []).map((step) => (
                  <div key={step.id} className={`step-row ${step.status}`}>
                    <span>{step.label}</span>
                    <strong>{step.status}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Workflow builder</h2>
                <span>paramétrable</span>
              </div>
              <div className="workflow-form">
                <label className="field">
                  <span>Seuil principal</span>
                  <input type="number" min="0.1" step="0.05" value={thresholdPct} onChange={(e) => setThresholdPct(Number(e.target.value))} />
                </label>
                <label className="field">
                  <span>Multiplicateur confirm</span>
                  <input type="number" min="1" step="0.05" value={confirmationMultiplier} onChange={(e) => setConfirmationMultiplier(Number(e.target.value))} />
                </label>
                <label className="field">
                  <span>Retries</span>
                  <input type="number" min="0" step="1" value={workflowRetry} onChange={(e) => setWorkflowRetry(Number(e.target.value))} />
                </label>
                <label className="field">
                  <span>Retry delay ms</span>
                  <input type="number" min="100" step="100" value={workflowRetryDelay} onChange={(e) => setWorkflowRetryDelay(Number(e.target.value))} />
                </label>
                <label className="field">
                  <span>Handler succès</span>
                  <select value={workflowStepHandler} onChange={(e) => setWorkflowStepHandler(e.target.value as StepHandlerMode)}>
                    <option value="none">none</option>
                    <option value="toast">toast</option>
                    <option value="console">console</option>
                    <option value="toast+sound">toast + sound</option>
                  </select>
                </label>
                <label className="field">
                  <span>Handler erreur</span>
                  <select value={workflowErrorHandler} onChange={(e) => setWorkflowErrorHandler(e.target.value as ErrorHandlerMode)}>
                    <option value="stop">stop</option>
                    <option value="toast-stop">toast + stop</option>
                    <option value="continue">continue</option>
                    <option value="toast-continue">toast + continue</option>
                  </select>
                </label>
              </div>
              <label className="toggle-line">
                <input type="checkbox" checked={workflowContinueOnError} onChange={(e) => setWorkflowContinueOnError(e.target.checked)} />
                <span>Autoriser `continueOnError` sur les étapes</span>
              </label>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'heatmap' && (
        <section className="heatmap-grid">
          {gainers.map((asset) => (
            <article
              key={asset.id}
              className={`heat-tile ${asset.trend}`}
              style={{ borderColor: asset.accent, background: `linear-gradient(160deg, rgba(255,255,255,0.08), ${asset.trend === 'up' ? 'rgba(61,217,177,0.18)' : asset.trend === 'down' ? 'rgba(255,98,98,0.16)' : 'rgba(255,255,255,0.05)'})` }}
            >
              <span>{asset.symbol}</span>
              <strong>{pct(asset.changePct)}</strong>
              <small>{money(asset)}</small>
            </article>
          ))}
        </section>
      )}

      {activeTab === 'signals' && (
        <section className="signals-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Alertes</h2>
              <span>{alerts.data?.length ?? 0}</span>
            </div>
            <div className="alert-list">
              {(alerts.data ?? []).map((alert) => (
                <article key={alert.id} className={`alert-card ${alert.severity} ${alert.acknowledged ? 'ack' : ''}`}>
                  <div>
                    <strong>{alert.assetLabel}</strong>
                    <p>{alert.message}</p>
                    <small>{new Date(alert.createdAt).toLocaleTimeString()}</small>
                  </div>
                  <button className="ghost-btn compact" onClick={() => void acknowledge.mutate(undefined, alert.id)}>
                    {alert.acknowledged ? 'Ack' : 'Ack now'}
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Desk journal</h2>
              <span>{journal.data?.length ?? 0}</span>
            </div>
            <div className="journal-list">
              {(journal.data ?? []).map((entry) => (
                <article key={entry.id} className={`journal-card ${entry.tone}`}>
                  <strong>{entry.title}</strong>
                  <p>{entry.detail}</p>
                  <small>{new Date(entry.createdAt).toLocaleTimeString()}</small>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {showDevtools && (
        <section className="devtools-wrap">
          <ScrewDevtools />
        </section>
      )}
    </div>
  );
}
