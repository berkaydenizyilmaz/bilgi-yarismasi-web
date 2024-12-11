export class APIError extends Error {
    status: number;
    code: string;
  
    constructor(message: string, status: number = 500, code: string = "INTERNAL_SERVER_ERROR") {
      super(message);
      this.name = "APIError";
      this.status = status;
      this.code = code;
    }
  }
  
  export class ValidationError extends APIError {
    constructor(message: string) {
      super(message, 400, "VALIDATION_ERROR");
      this.name = "ValidationError";
    }
  }
  
  export class AuthenticationError extends APIError {
    constructor(message: string = "Yetkilendirme gerekli") {
      super(message, 401, "AUTHENTICATION_ERROR");
      this.name = "AuthenticationError";
    }
  }

export class NotFoundError extends APIError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
} 