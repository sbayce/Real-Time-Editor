import { Router } from "express"
import signup from "../controller/auth/signup"
import signin from "../controller/auth/signin"
import logout from "../controller/auth/logout"

const router = Router()

router.post("/signup", signup)
router.post("/signin", signin)
router.post("/logout", logout)

export default router
