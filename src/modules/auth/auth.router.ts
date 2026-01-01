import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/signup", authController.signUp);
router.post("/signin", authController.signin);

export const authRoutes = router;
