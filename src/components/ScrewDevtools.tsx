'use client';

import React, { useMemo, useState, type CSSProperties } from 'react';
import { useScrewDevtools } from '../hooks/useScrewDevtools';
import { useScrewEvents } from '../hooks/useScrewEvents';
import type { RequestEvent } from '../types';

type Tab = 'queries' | 'mutations' | 'metrics' | 'events' | 'cache';

const styles: Record<string, CSSProperties> = {
  panel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: 520,
    maxHeight: 400,
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: 12,
    zIndex: 2147483647,
    borderTopLeftRadius: 8,
    boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#16213e',
    borderBottom: '1px solid #0f3460'
  },
  title: { fontWeight: 700, fontSize: 13 },
  tabs: {
    display: 'flex',
    gap: 4,
    padding: '4px 12px',
    backgroundColor: '#16213e',
    borderBottom: '1px solid #0f3460'
  },
  tab: {
    padding: '4px 10px',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#8899aa',
    fontSize: 11
  },
  activeTab: {
    backgroundColor: '#0f3460',
    color: '#e0e0e0'
  },
  body: {
    flex: 1,
    overflow: 'auto',
    padding: 8
  },
  row: {
    padding: '4px 8px',
    borderBottom: '1px solid #0f3460',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badge: {
    padding: '1px 6px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600
  },
  metricCard: {
    padding: '6px 10px',
    backgroundColor: '#16213e',
    borderRadius: 6,
    marginBottom: 4
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#8899aa',
    cursor: 'pointer',
    fontSize: 18
  }
};

const statusColors: Record<string, string> = {
  idle: '#8899aa',
  loading: '#f0c040',
  success: '#40c060',
  error: '#e04040',
  stale: '#c09040',
  pending: '#f0c040'
};

const eventColors: Record<string, string> = {
  'query:start': '#60a0f0',
  'query:success': '#40c060',
  'query:error': '#e04040',
  'query:invalidate': '#c09040',
  'mutation:start': '#f0a040',
  'mutation:success': '#40c060',
  'mutation:error': '#e04040'
};

export const ScrewDevtools = ({
  defaultTab = 'queries',
  defaultOpen = false
}: {
  defaultTab?: Tab;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const devtools = useScrewDevtools();

  useScrewEvents((event) => {
    setEvents((prev) => [event, ...prev].slice(0, 100));
  });

  const tabs: { key: Tab; label: string }[] = useMemo(
    () => [
      { key: 'queries', label: `Queries (${devtools.queries.length})` },
      { key: 'mutations', label: `Mutations (${devtools.mutations.length})` },
      { key: 'metrics', label: 'Metrics' },
      { key: 'events', label: `Events (${events.length})` },
      { key: 'cache', label: 'Cache' }
    ],
    [devtools.queries.length, devtools.mutations.length, events.length]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 8,
          right: 8,
          zIndex: 2147483647,
          backgroundColor: '#1a1a2e',
          color: '#e0e0e0',
          border: 'none',
          borderRadius: 8,
          padding: '6px 12px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
        }}
      >
        ⚡ RS Devtools
      </button>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>⚡ ReactScrew Devtools</span>
        <button onClick={() => setOpen(false)} style={styles.toggleBtn}>×</button>
      </div>

      <div style={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ ...styles.tab, ...(tab === t.key ? styles.activeTab : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.body}>
        {tab === 'queries' && (
          devtools.queries.length === 0 ? <Empty label="No queries" /> :
          devtools.queries.map((q, i) => (
            <div key={i} style={styles.row}>
              <div>
                <span style={{ color: '#8899aa' }}>{String(q.queryKey)}</span>
              </div>
              <span style={{
                ...styles.badge,
                backgroundColor: statusColors[q.state.status] ?? '#8899aa',
                color: '#fff'
              }}>
                {q.state.status}
              </span>
            </div>
          ))
        )}

        {tab === 'mutations' && (
          devtools.mutations.length === 0 ? <Empty label="No mutations" /> :
          devtools.mutations.map((m, i) => (
            <div key={i} style={styles.row}>
              <span>{m.mutationKey}</span>
              <span style={{
                ...styles.badge,
                backgroundColor: statusColors[m.state.status] ?? '#8899aa',
                color: '#fff'
              }}>
                {m.state.status}
              </span>
            </div>
          ))
        )}

        {tab === 'metrics' && (
          <div>
            <MetricCard label="Cache Hits" value={devtools.metrics.cacheHits} />
            <MetricCard label="Cache Misses" value={devtools.metrics.cacheMisses} />
            <MetricCard label="Network Requests" value={devtools.metrics.networkRequests} />
            <MetricCard label="Deduped Requests" value={devtools.metrics.dedupedRequests} />
            <MetricCard label="Avg Duration" value={`${Math.round(devtools.metrics.averageRequestDurationMs)}ms`} />
          </div>
        )}

        {tab === 'events' && (
          events.length === 0 ? <Empty label="No events" /> :
          events.map((ev, i) => (
            <div key={i} style={{
              ...styles.row,
              borderLeft: `3px solid ${eventColors[ev.type] ?? '#8899aa'}`,
              paddingLeft: 8
            }}>
              <div>
                <span style={{ color: '#8899aa', fontSize: 10 }}>
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
                <span style={{ marginLeft: 8 }}>{ev.screwName}.{ev.methodName}</span>
              </div>
              <span style={{ color: eventColors[ev.type] ?? '#8899aa', fontSize: 10 }}>
                {ev.durationMs !== undefined ? `${ev.durationMs}ms` : ev.type.split(':')[1]}
              </span>
            </div>
          ))
        )}

        {tab === 'cache' && (
          <div>
            <p style={{ color: '#8899aa', margin: '0 0 8px' }}>
              {devtools.queries.length} entries in cache
            </p>
            {devtools.queries.map((q, i) => (
              <div key={i} style={styles.metricCard}>
                <div><strong>{String(q.queryKey)}</strong></div>
                <div style={{ color: '#8899aa', fontSize: 10, marginTop: 2 }}>
                  status: {q.state.status} · updated: {q.state.updatedAt ? new Date(q.state.updatedAt).toLocaleTimeString() : 'never'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string; value: number | string }) => (
  <div style={styles.metricCard}>
    <div style={{ color: '#8899aa', fontSize: 10 }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
  </div>
);

const Empty = ({ label }: { label: string }) => (
  <p style={{ color: '#556677', textAlign: 'center', marginTop: 32 }}>{label}</p>
);
