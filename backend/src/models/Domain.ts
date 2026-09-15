import { Schema } from "mongoose";

export interface IDomain {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "coming_soon";
  description?: string;
}

export const DomainSchema = new Schema<IDomain>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, enum: ["active", "coming_soon"], default: "coming_soon" },
  description: { type: String },
});
