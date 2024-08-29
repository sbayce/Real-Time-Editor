import { Router } from "express"
import createEditor from "../controller/user/create-editor"
import deleteEditor from "../controller/user/delete-editor"
import inviteCollaborator from "../controller/user/invite-collaborator"
import viewEditor from "../controller/user/view-editor"
import getWorkspace from "../controller/user/get-wrokspace"
import getUser from "../controller/user/get-user"

const router = Router()

router.post("/create-editor", createEditor)
router.delete("/delete-editor/:id", deleteEditor)
router.post("/invite-collaborator/:editorId", inviteCollaborator)
router.get("/view-editor/:editorId", viewEditor)
router.get("/get-workspace", getWorkspace)
router.get("/me", getUser)

export default router
