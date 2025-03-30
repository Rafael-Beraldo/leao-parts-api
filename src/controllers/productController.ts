import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const createProduct = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(403).json({ message: "Unauthorized." });
  }

  const { name, description, price, image_url } = req.body;

  if (!name || !description || !price || !image_url) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  const { data, error } = await supabase
    .from("products")
    .insert([{ name, description, price, image_url, is_active: true }])
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ message: "Erro ao criar produto", error });
  }

  res.status(201).json(data);
};

export const updateProduct = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(403).json({ message: "Unauthorized." });
  }

  const { id } = req.params;
  const { name, description, price, image_url } = req.body;

  const updates: any = {};
  if (name) updates.name = name;
  if (description) updates.description = description;
  if (price) updates.price = price;
  if (image_url) updates.image_url = image_url;

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ message: "Erro ao atualizar produto", error });
  }

  res.status(200).json({ message: "Produto atualizado com sucesso", product: data });
};

export const getProducts = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    return res.status(500).json({ message: "Erro ao obter produtos", error });
  }

  res.status(200).json(data);
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error || !data) {
    return res.status(404).json({ message: "Produto não encontrado." });
  }

  res.status(200).json(data);
};
