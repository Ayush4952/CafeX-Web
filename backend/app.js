import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./route/authRoutes.js";
import dashboardRoutes from "./route/dashboardRoutes.js";
import menuRoutes from "./route/menuRoutes.js";
import orderRoutes from "./route/orderRoutes.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/uploads", express.static(path.join(currentDirectory, "uploads")));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "CafeX API" }));
app.use(notFound);
app.use(errorHandler);
