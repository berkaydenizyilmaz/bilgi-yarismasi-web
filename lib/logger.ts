import { NextRequest } from 'next/server';

type LogLevel = 'info' | 'warn' | 'error';

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  path?: string;
  userId?: number;
  error?: any;
  metadata?: Record<string, any>;
}

class Logger {
  private async saveLog(logData: LogData) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
    } catch (error) {
      console.error('Log kaydetme hatası:', error);
    }
  }

  info(message: string, metadata?: Record<string, any>) {
    const logData: LogData = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.saveLog(logData);
  }

  warn(message: string, metadata?: Record<string, any>) {
    const logData: LogData = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.saveLog(logData);
  }

  error(error: Error, metadata?: Record<string, any>) {
    const logData: LogData = {
      level: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        stack: error.stack,
      },
      metadata,
    };
    this.saveLog(logData);
  }

  request(req: NextRequest, metadata?: Record<string, any>) {
    const logData: LogData = {
      level: 'info',
      message: `${req.method} ${req.url}`,
      timestamp: new Date().toISOString(),
      path: req.url,
      metadata: {
        ...metadata,
        headers: Object.fromEntries(req.headers),
        query: Object.fromEntries(new URL(req.url).searchParams),
      },
    };
    this.saveLog(logData);
  }
}

export const logger = new Logger();