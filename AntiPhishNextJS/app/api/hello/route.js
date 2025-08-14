import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function GET(req) {
  const token = req.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return new Response('Authentication required', { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return new Response('Hello', {status:200})
  } catch (err) {
    return new Response('Invalid token', { status: 401 });
  }
}
