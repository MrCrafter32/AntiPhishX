import bcrypt from "bcryptjs";

// Hash the password before storing in the database
export async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 12); // 12 is the saltRounds
  return hashedPassword;
}

// Compare the entered password with the stored hashed password
export async function verifyPassword(password, hashedPassword) {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}
