import express, { Router } from "express";
import { registerUser, loginUser, updateUser } from "../controllers/userController";
import { supabase } from "../config/supabase";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.put("/user/update", authenticateJWT, updateUser)

router.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    return res.status(500).json({ message: "Erro ao buscar usuários", error });
  }

  return res.status(200).json(data);
});

export default router;
