import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: number;
  email: string;
}

export async function verifyAuth(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}