import mongoose, { Schema, Document, Model, FilterQuery } from "mongoose";
import { randomUUID } from "crypto";
import { isMongoConnected } from "../db/connection";

export interface Repository<T extends { _id: string }> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(predicate: Partial<T>): Promise<T | null>;
  find(predicate?: Partial<T>, opts?: { sort?: keyof T; sortDir?: 1 | -1; limit?: number }): Promise<T[]>;
  updateById(id: string, data: Partial<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  count(predicate?: Partial<T>): Promise<number>;
}

/**
 * In-memory fallback store. Used automatically when no real MongoDB is
 * connected (see db/connection.ts) — every write here is lost on restart.
 * This is intentional demo/dev behavior, documented in README.md, not a
 * hidden limitation: the exact same Mongoose schema is used for real
 * MongoDB persistence in production (docker-compose with a real `mongo`
 * image) whenever MONGODB_URI is set.
 */
class MemoryStore<T extends { _id: string }> implements Repository<T> {
  private rows = new Map<string, T>();

  async create(data: Partial<T>): Promise<T> {
    const _id = (data as any)._id ?? randomUUID();
    const row = { ...data, _id } as T;
    this.rows.set(_id, row);
    return row;
  }

  async findById(id: string): Promise<T | null> {
    return this.rows.get(id) ?? null;
  }

  private matches(row: T, predicate: Partial<T>): boolean {
    return Object.entries(predicate).every(([k, v]) => (row as any)[k] === v);
  }

  async findOne(predicate: Partial<T>): Promise<T | null> {
    for (const row of this.rows.values()) {
      if (this.matches(row, predicate)) return row;
    }
    return null;
  }

  async find(
    predicate: Partial<T> = {},
    opts: { sort?: keyof T; sortDir?: 1 | -1; limit?: number } = {}
  ): Promise<T[]> {
    let results = [...this.rows.values()].filter((r) => this.matches(r, predicate));
    if (opts.sort) {
      const dir = opts.sortDir ?? 1;
      results.sort((a, b) => {
        const av = (a as any)[opts.sort as string];
        const bv = (b as any)[opts.sort as string];
        return av > bv ? dir : av < bv ? -dir : 0;
      });
    }
    if (opts.limit) results = results.slice(0, opts.limit);
    return results;
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    const existing = this.rows.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, _id: id } as T;
    this.rows.set(id, updated);
    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    return this.rows.delete(id);
  }

  async count(predicate: Partial<T> = {}): Promise<number> {
    return (await this.find(predicate)).length;
  }
}

class MongooseStore<T extends { _id: string }> implements Repository<T> {
  constructor(private model: Model<any>) {}

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc.toObject({ virtuals: true }) as T;
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).lean();
    return (doc as unknown as T) ?? null;
  }

  async findOne(predicate: Partial<T>): Promise<T | null> {
    const doc = await this.model.findOne(predicate as FilterQuery<any>).lean();
    return (doc as unknown as T) ?? null;
  }

  async find(
    predicate: Partial<T> = {},
    opts: { sort?: keyof T; sortDir?: 1 | -1; limit?: number } = {}
  ): Promise<T[]> {
    let q = this.model.find(predicate as FilterQuery<any>);
    if (opts.sort) q = q.sort({ [opts.sort as string]: opts.sortDir ?? 1 });
    if (opts.limit) q = q.limit(opts.limit);
    const docs = await q.lean();
    return docs as unknown as T[];
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).lean();
    return (doc as unknown as T) ?? null;
  }

  async deleteById(id: string): Promise<boolean> {
    const res = await this.model.findByIdAndDelete(id);
    return !!res;
  }

  async count(predicate: Partial<T> = {}): Promise<number> {
    return this.model.countDocuments(predicate as FilterQuery<any>);
  }
}

const memoryStores = new Map<string, MemoryStore<any>>();

/**
 * Returns a Repository<T> for the given Mongoose schema/model name.
 * Chooses the real MongoDB-backed implementation when connected, and a
 * process-local in-memory implementation otherwise (see MemoryStore doc
 * comment above). Both implement the same interface, so calling code never
 * needs to know which is active.
 */
export function createRepository<T extends { _id: string }>(
  modelName: string,
  schema: Schema
): Repository<T> {
  return new Proxy({} as Repository<T>, {
    get(_target, prop: keyof Repository<T>) {
      return async (...args: any[]) => {
        if (isMongoConnected()) {
          const model: Model<any> =
            (mongoose.models[modelName] as Model<any>) || mongoose.model(modelName, schema);
          const store = new MongooseStore<T>(model);
          return (store[prop] as any)(...args);
        }
        if (!memoryStores.has(modelName)) memoryStores.set(modelName, new MemoryStore<any>());
        const store = memoryStores.get(modelName)!;
        return (store[prop] as any)(...args);
      };
    },
  });
}
