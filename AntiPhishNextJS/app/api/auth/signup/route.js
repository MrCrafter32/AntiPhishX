import { hashPassword } from "@/lib/hash";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return new Response("Email and password are required", { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return new Response("User already exists", { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    },
  });

  return new Response(JSON.stringify(newUser), { status: 201 });
}
