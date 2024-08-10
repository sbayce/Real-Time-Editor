import { Request, Response } from "express"
import checkAccessPermission from "../../lib/editor/check-access-permission"
import { io } from "../../socket/socket"

const updateContent = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const { content } = req.body
    const editorId = req.params.editorId

    const editorExists = await postgres.query(
      "SELECT * FROM editor WHERE id = $1",
      [editorId]
    )
    if (editorExists.rowCount === 0) {
      res.status(400).json("Editor does not exist")
      return
    }
    const editor = editorExists.rows[0]

    const hasAccessPermission = checkAccessPermission(editor, userId, postgres)
    if (!hasAccessPermission) {
      res
        .status(403)
        .json({ message: "User is neither an owner nor a collaborator" })
      return
    }
    const updatedEditor = await postgres.query(
      "UPDATE editor SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [content, editorId]
    )
    if (updatedEditor.rowCount !== 1) {
      throw new Error("Error while updating editor content.")
    }
    io.to(editorId).emit("recieve_message", content)
    res.status(201).json({ message: "Editor updated" })
  } catch (error) {
    res.status(500).json(error)
  }
}
export default updateContent
