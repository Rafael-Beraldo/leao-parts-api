import express, { Request, Response } from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import cors from "cors";
import jwt, { JwtPayload } from "jsonwebtoken";

// Rotas e middleware
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import { authenticateJWT } from "./middleware/authMiddleware";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://leao-parts.vercel.app"],
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

export const handler = serverless(app);
