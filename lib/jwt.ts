import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export function signJWT(payload: any, options: jwt.SignOptions = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',  // Token 1 gün geçerli olsun
    ...options,
  })
}

export function verifyJWT<T>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T
} 