import { Router } from "express"
import updateContent from "../controller/editor/update-content"
import setSnapShot from "../controller/editor/set-snapshot"
import updateTitle from "../controller/editor/update-title"

const router = Router()

router.post("/update-editor/:editorId", updateContent)
router.post("/set-snapshot/:editorId", setSnapShot)
router.post("/update-title/:editorId", updateTitle)

export default router
