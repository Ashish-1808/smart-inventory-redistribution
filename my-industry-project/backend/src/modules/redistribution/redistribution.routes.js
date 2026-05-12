import express from "express";
import controller from "./redistribution.controller.js";
import redistribution from "./redistribution.service.js";

const router = express.Router();

router.get("/run", controller.redistribution);
export default router;
