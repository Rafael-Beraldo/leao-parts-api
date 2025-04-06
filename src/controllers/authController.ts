import { Request, Response } from "express";

import { supabase } from "../config/supabase";

import bcrypt from "bcryptjs";

import { generateToken } from "../utils/jwtUtils";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(400).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials." });
  }

  const token = generateToken(user.id);
  res.status(200).json({ message: "Login successful", token });
};
