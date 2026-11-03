import express from "express";
import cors from "cors";
import restaurants from "./api/restaurants.route.js";
import users from "./api/users.route.js";

const app = express();

let dbReady = false;
let dbError = null;
export const setDbReady = (ready, error = null) => {
  dbReady = ready;
  dbError = error;
};

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(dbReady ? 200 : 503).json({
    ok: dbReady,
    db: dbReady ? "connected" : "connecting",
    ...(dbError && { lastError: dbError }),
  });
});

// Until the database is connected, fail fast instead of letting requests hang.
app.use("/api", (req, res, next) => {
  if (!dbReady) {
    res.status(503).json({ error: "Database is starting up, please retry shortly" });
    return;
  }
  next();
});

app.use("/api/v1/restaurants", restaurants);
app.use("/api/v1/users", users);
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

export default app;
