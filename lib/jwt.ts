import jwt from 'jsonwebtoken'

interface JWTPayload {
  id: number;
  email: string;
  username: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export function signJWT(payload: JWTPayload, options: jwt.SignOptions = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',  // Token 1 gün geçerli olsun
    ...options,
  });
}

export function verifyJWT<T extends JWTPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}