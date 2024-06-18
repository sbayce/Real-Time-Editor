import { Router } from "express"
import updateContent from "../controller/editor/update-content"

const router = Router()

router.post("/update-editor/:editorId", updateContent)

export default router
