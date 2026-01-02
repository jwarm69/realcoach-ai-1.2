export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` Error: ${error.message}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }

    if (error && this.isDevelopment) {
      console.error(error.stack);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  apiRequest(method: string, endpoint: string, context?: Record<string, any>) {
    this.info(`${method} ${endpoint}`, context);
  }

  apiResponse(method: string, endpoint: string, status: number, duration: number) {
    this.info(`${method} ${endpoint} - ${status} (${duration}ms)`), {
      status,
      duration,
    };
  }

  apiError(method: string, endpoint: string, error: Error, context?: Record<string, any>) {
    this.error(`${method} ${endpoint} failed`, error, context);
  }

  cronJob(jobName: string, status: 'started' | 'completed' | 'failed', context?: Record<string, any>) {
    const message = `Cron job: ${jobName} - ${status}`;
    if (status === 'failed') {
      this.error(message, undefined, context);
    } else {
      this.info(message, context);
    }
  }
}

export const logger = new Logger();
