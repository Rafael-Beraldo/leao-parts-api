import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage: storage }).single("image");

const uploadImageToSupabase = async (file: Express.Multer.File, fileName: string) => {
  const fileBuffer = fs.readFileSync(file.path);

  console.log("Arquivo lido corretamente:", fileBuffer);

  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(`public/${fileName}`, fileBuffer, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Erro ao fazer upload da imagem:", error); 
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }

  const publicUrl = supabase.storage.from("product-images").getPublicUrl(`public/${fileName}`).data.publicUrl;

  if (!publicUrl) {
    throw new Error("Erro ao obter a URL pública da imagem.");
  }

  return publicUrl;
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price } = req.body;
  const imageFile = req.file;

  if (!name || !description || !price || !imageFile) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const imageUrl = await uploadImageToSupabase(imageFile, imageFile.filename);

    const { data, error } = await supabase
      .from("products")
      .insert([{ name, description, price, image_url: imageUrl, is_active: true }])
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ message: "Erro ao criar produto", error });
    }

    res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao fazer upload da imagem", error: error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
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
