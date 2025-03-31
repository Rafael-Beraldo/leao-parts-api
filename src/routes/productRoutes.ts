import express from "express";
import { createProduct, updateProduct, getProducts, getProductById } from "../controllers/productController";
import { authenticateJWT } from "../middleware/authMiddleware";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/products", authenticateJWT, upload.single("image"), createProduct);
router.put("/products/:id", authenticateJWT, upload.single("image"), updateProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);

export default router;
