import { Router } from "express"
import signup from "../controller/auth/signup"
import signin from "../controller/auth/signin"

const router = Router()

router.post("/signup", signup)
router.post("/signin", signin)

export default router
