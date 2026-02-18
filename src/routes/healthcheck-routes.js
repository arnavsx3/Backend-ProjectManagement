import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck-controllers.js";
const router = Router()
export default router

router.route("/").get(healthCheck)

export{healthCheck}