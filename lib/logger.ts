type LogLevel = 'info' | 'warn' | 'error';
type LogAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'auth' 
  | 'error' 
  | 'access'
  | 'list'
  | 'read';
type LogModule = 
  | 'user' 
  | 'question' 
  | 'category' 
  | 'quiz' 
  | 'auth' 
  | 'system' 
  | 'feedback';

interface LogData {
  level: LogLevel;
  module: LogModule;
  action: LogAction;
  message: string;
  timestamp: string;
  path?: string;
  userId?: number;
  error?: any;
  metadata?: Record<string, any>;
}

class Logger {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  private async saveLog(logData: LogData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        console.error('Log kaydetme hatası:', await response.text());
      }
    } catch (error) {
      console.error('Log kaydetme hatası:', error);
    }
  }

  // Kullanıcı işlemleri için helper metodlar
  userCreated(username: string, userId: number, metadata?: Record<string, any>) {
    this.info('user', 'create', `Yeni kullanıcı oluşturuldu: ${username}`, {
      userId,
      ...metadata
    });
  }

  userUpdated(username: string, userId: number, metadata?: Record<string, any>) {
    this.info('user', 'update', `Kullanıcı güncellendi: ${username}`, {
      userId,
      ...metadata
    });
  }

  userDeleted(username: string, userId: number, metadata?: Record<string, any>) {
    this.info('user', 'delete', `Kullanıcı silindi: ${username}`, {
      userId,
      ...metadata
    });
  }

  // Soru işlemleri için helper metodlar
  questionCreated(questionId: number, metadata?: Record<string, any>) {
    this.info('question', 'create', `Yeni soru eklendi (ID: ${questionId})`, metadata);
  }

  questionUpdated(questionId: number, metadata?: Record<string, any>) {
    this.info('question', 'update', `Soru güncellendi (ID: ${questionId})`, metadata);
  }

  questionDeleted(questionId: number, metadata?: Record<string, any>) {
    this.info('question', 'delete', `Soru silindi (ID: ${questionId})`, metadata);
  }

  // Kategori işlemleri için helper metodlar
  categoryCreated(name: string, categoryId: number, metadata?: Record<string, any>) {
    this.info('category', 'create', `Yeni kategori oluşturuldu: ${name}`, {
      categoryId,
      ...metadata
    });
  }

  categoryUpdated(name: string, categoryId: number, metadata?: Record<string, any>) {
    this.info('category', 'update', `Kategori güncellendi: ${name}`, {
      categoryId,
      ...metadata
    });
  }

  categoryDeleted(name: string, categoryId: number, metadata?: Record<string, any>) {
    this.info('category', 'delete', `Kategori silindi: ${name}`, {
      categoryId,
      ...metadata
    });
  }

  // Auth işlemleri için helper metodlar
  authLog(action: 'login' | 'logout' | 'register', message: string, metadata?: Record<string, any>) {
    this.info('auth', 'auth', message, metadata);
  }

  // Public metodlar
  public info(module: LogModule, action: LogAction, message: string, metadata?: Record<string, any>) {
    const logData: LogData = {
      level: 'info',
      module,
      action,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.saveLog(logData);
  }

  public warn(module: LogModule, action: LogAction, message: string, metadata?: Record<string, any>) {
    const logData: LogData = {
      level: 'warn',
      module,
      action,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.saveLog(logData);
  }

  public error(module: LogModule, error: Error, metadata?: Record<string, any>) {
    const logData: LogData = {
      level: 'error',
      module,
      action: 'error',
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
}

export const logger = new Logger();