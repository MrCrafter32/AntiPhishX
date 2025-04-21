import bcrypt from 'bcryptjs';
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );

  // Return the token along with user details
  const sessionData = {
    id: user.id,
    email: user.email,
    name: user.name || 'User',
    image: user.image || null,
    token: token
  };

  return new Response(JSON.stringify(sessionData), { status: 200 });
}
