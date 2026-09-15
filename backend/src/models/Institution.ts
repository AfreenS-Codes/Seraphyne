import { Schema } from "mongoose";

export interface IInstitution {
  _id: string;
  name: string;
  country?: string;
  createdAt: string;
}

export const InstitutionSchema = new Schema<IInstitution>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  country: { type: String },
  createdAt: { type: String, required: true },
});
