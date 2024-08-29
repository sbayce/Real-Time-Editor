import { Router } from "express"
import setSnapShot from "../controller/editor/set-snapshot"
import updateTitle from "../controller/editor/update-title"

const router = Router()

router.post("/set-snapshot/:editorId", setSnapShot)
router.post("/update-title/:editorId", updateTitle)

export default router
