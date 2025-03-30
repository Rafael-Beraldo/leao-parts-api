import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload; 
  }
}

export const createUser = async (req: Request, res: Response) => {
    const { email, name, password, is_active } = req.body;
  
    if (!email || !name || !password || !is_active) {
      return res.status(400).json({ message: "Email, name, and password are required." });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, name, password: hashedPassword, is_active}])
      .select("*")
      .single();
  
    if (error) {
      return res.status(500).json({ message: "Erro ao criar usuário", error });
    }

    console.log("User created:", data);
    
    res.status(201).json(data);
  };

  export const registerUser = async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
  
    if (!email || !name || !password) {
      return res.status(400).json({ message: "Email, name, and password are required." });
    }
  
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
  
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, name, password: hashedPassword, is_active: true }])
      .select("*")
      .single();
  
    if (error) {
      return res.status(500).json({ message: "Error creating user", error });
    }
  
    const token = jwt.sign(
      { id: data.id, email: data.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
  
    return res.status(201).json({
      message: "User created successfully",
      user: { id: data.id, email: data.email, name: data.name },
      token,
    });
  };

  export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
  
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
  
    if (error || !user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
  
    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  };

  export const updateUser = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized." });
    }
  
    const { name, email, password, is_active } = req.body;
    const userId = req.user.id; 
  
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (is_active)  updates.is_active = is_active;
  
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("*")
      .single();
  
    if (error) {
      return res.status(500).json({ message: "Error updating user", error });
    }
  
    return res.status(200).json({ message: "User updated successfully", user: data });
  };

export const getUsers = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    return res.status(500).json({ message: "Erro ao obter usuários", error });
  }

  res.status(200).json(data);
};
