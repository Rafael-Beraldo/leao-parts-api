import express, { Request, Response } from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import cors from "cors";
import jwt, { JwtPayload } from "jsonwebtoken";

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";

import { authenticateJWT } from "./middleware/authMiddleware";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5080",
      "https://leao-parts.vercel.app",
      "https://leao-parts-api.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
  app.listen(5080, () => {
    console.log("🧪 Ambiente local: servidor rodando na porta 5080");
  });
}

app.get("/api/health-check", (req: Request, res: Response) => {
  res.send("API online!");
});

app.use("/api", userRoutes);
app.use("/api", productRoutes);

app.get("/api/protected", authenticateJWT, (req: Request, res: Response) => {
  if (req.user) {
    res.json({ message: "Você está autenticado!", user: req.user });
  } else {
    res.status(401).json({ message: "Não autenticado" });
  }
});

export default app;
