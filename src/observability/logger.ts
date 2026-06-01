'use client';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogFormat = 'pretty' | 'json';

export interface LoggerConfig {
  level?: LogLevel;
  format?: LogFormat;
  prefix?: string;
  enabled?: boolean;
}

export interface ScrewLogger {
  debug: (msg: string, meta?: Record<string, unknown>) => void;
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
  child: (prefix: string) => ScrewLogger;
}

const levelOrder: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const shouldLog = (configLevel: LogLevel, msgLevel: LogLevel): boolean =>
  levelOrder[msgLevel] >= levelOrder[configLevel];

const formatEntry = (
  level: LogLevel,
  prefix: string,
  msg: string,
  meta?: Record<string, unknown>,
  format?: LogFormat
): string => {
  const ts = new Date().toISOString();
  if (format === 'json') {
    return JSON.stringify({ timestamp: ts, level, prefix, message: msg, ...meta });
  }
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level.toUpperCase()}] ${prefix} ${msg}${metaStr}`;
};

export const createScrewLogger = (config?: LoggerConfig): ScrewLogger => {
  const cfg = {
    level: config?.level ?? 'info',
    format: config?.format ?? 'pretty',
    prefix: config?.prefix ?? '[reactscrew]',
    enabled: config?.enabled ?? true
  };

  const log =
    (level: LogLevel) =>
    (msg: string, meta?: Record<string, unknown>) => {
      if (!cfg.enabled) return;
      if (!shouldLog(cfg.level, level)) return;
      const entry = formatEntry(level, cfg.prefix, msg, meta, cfg.format);
      switch (level) {
        case 'error':
          console.error(entry);
          break;
        case 'warn':
          console.warn(entry);
          break;
        default:
          console.log(entry);
      }
    };

  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    child: (childPrefix: string) =>
      createScrewLogger({
        ...cfg,
        prefix: `${cfg.prefix} ${childPrefix}`
      })
  };
};

export const defaultLogger = createScrewLogger({ level: 'info', format: 'pretty' });
