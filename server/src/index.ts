import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { importRouter } from "./routes/import";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/import", importRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
