import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct
} from "../controllers/productController";
import { authenticateJWT } from "../middleware/authMiddleware"; 

const router = express.Router();

router.post("/products", authenticateJWT, createProduct);

router.get("/products", getProducts);

router.get("/products/:id", getProductById);

router.put("/products/:id", authenticateJWT, updateProduct);

export default router;
