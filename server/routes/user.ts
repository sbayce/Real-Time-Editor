import { Router } from "express"
import createEditor from "../controller/user/create-editor"
import deleteEditor from "../controller/user/delete-editor"

const router = Router()

router.post("/create-editor", createEditor)
router.post("/delete-editor/:id", deleteEditor)

export default router
