import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createRepository } from "../repositories/createRepository";
import { IUser, UserSchema } from "../models/User";
import { signToken } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";

const users = createRepository<IUser>("User", UserSchema);

export async function signup(email: string, password: string, name: string) {
  const existing = await users.findOne({ email: email.toLowerCase() } as Partial<IUser>);
  if (existing) throw new HttpError(409, "An account with this email already exists.", "email_taken");
  if (password.length < 8) {
    throw new HttpError(422, "Password must be at least 8 characters.", "weak_password");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await users.create({
    _id: randomUUID(),
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: "student",
    institutionId: null,
    createdAt: new Date().toISOString(),
  });
  const token = signToken({ userId: user._id, email: user.email, role: user.role });
  return { token, user: toPublicUser(user) };
}

export async function login(email: string, password: string) {
  const user = await users.findOne({ email: email.toLowerCase() } as Partial<IUser>);
  if (!user) throw new HttpError(401, "Invalid email or password.", "invalid_credentials");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid email or password.", "invalid_credentials");
  const token = signToken({ userId: user._id, email: user.email, role: user.role });
  return { token, user: toPublicUser(user) };
}

export async function getUserById(userId: string) {
  const user = await users.findById(userId);
  if (!user) throw new HttpError(404, "User not found.", "user_not_found");
  return toPublicUser(user);
}

function toPublicUser(user: IUser) {
  return { id: user._id, email: user.email, name: user.name, role: user.role };
}

export { users as userRepository };
