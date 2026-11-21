
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const URI = process.env.MONGODB_URI || "";

if (!URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

const globalMongoose = globalThis as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const cached =
  globalMongoose.mongoose ??
  (globalMongoose.mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(URI, { bufferCommands: false })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Failed:", error);
    throw error;
  }

  return cached.conn;
}
