import express from "express";
import cors from "cors";
import restaurants from "./api/restaurants.route.js";
import users from "./api/users.route.js";

const app = express();

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

app.use("/api/v1/restaurants", restaurants);
app.use("/api/v1/users", users);
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

export default app;
