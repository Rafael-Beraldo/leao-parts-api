import express from "express";
import {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  searchProductsByName,
  upload,
} from "../controllers/productController";

import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/products", upload, authenticateJWT, createProduct);

router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.get("/products/search", searchProductsByName);
router.put("/products/:id", authenticateJWT, updateProduct);

export default router;
