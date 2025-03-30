import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { authenticateJWT } from "./middleware/authMiddleware";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes"

dotenv.config();

const app = express();

app.use(express.json());

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;  
    }
  }
}

app.get("/health-check", (req: Request, res: Response) => {
  res.send("Ping!");
});

app.use(userRoutes);
app.use(productRoutes);

app.get("/protected", authenticateJWT, (req: Request, res: Response) => {
  if (req.user) {
    res.json({ message: "Você está autenticado!", user: req.user });
  } else {
    res.status(401).json({ message: "Não autenticado" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
