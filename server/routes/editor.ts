import { Router } from "express"
import updateContent from "../controller/editor/update-content"
import setSnapShot from "../controller/editor/set-snapshot"

const router = Router()

router.post("/update-editor/:editorId", updateContent)
router.post("/set-snapshot/:editorId", setSnapShot)

export default router
