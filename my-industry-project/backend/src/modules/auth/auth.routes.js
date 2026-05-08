import express from "express";
import controller from "./auth.controller.js";

const router = express.Router();

router.post("/login", controller.login);
router.post("/signup", controller.signup);

export default router;
