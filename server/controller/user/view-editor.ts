import { Request, Response } from "express"
import checkAccessPermission from "../../lib/editor/check-access-permission"

const viewEditor = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
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
    const hasAccessPermission = checkAccessPermission(editor, userId)
    if (!hasAccessPermission) {
      res
        .status(403)
        .json({ message: "User is neither an owner nor a collaborator" })
      return
    }
    res.status(201).json({ ...editor, userId: userId })
  } catch (error) {
    res.status(500).json(error)
  }
}
export default viewEditor
