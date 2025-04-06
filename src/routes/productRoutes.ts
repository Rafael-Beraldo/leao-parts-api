import express from "express";

import multer from "multer";

import {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  searchProductsByName,
} from "../controllers/productController";

import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/products",
  upload.single("image"),
  authenticateJWT,
  createProduct
);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.get("/products/search", searchProductsByName);
router.put("/products/:id", authenticateJWT, updateProduct);

export default router;
