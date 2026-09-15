import { Schema } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "student" | "institution_admin" | "admin";
  institutionId?: string | null;
  createdAt: string;
}

export const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["student", "institution_admin", "admin"], default: "student" },
  institutionId: { type: String, default: null },
  createdAt: { type: String, required: true },
});
