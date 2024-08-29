import { Request, Response } from "express"

const updateTitle = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const { title } = req.body
    const editorId = req.params.editorId

    const editorExists = await postgres.query(
      "SELECT * FROM editor WHERE id = $1",
      [editorId]
    )
    if (editorExists.rowCount === 0) {
      res.status(400).json("Editor does not exist")
      return
    }

    const hasAccess = await postgres.query("SELECT * FROM user_access WHERE user_id = $1 AND editor_id = $2", [userId, editorId])
    if(hasAccess.rowCount !== 1){
      res.status(403).json({ message: "User is neither an owner nor a collaborator" })
      return
    }
    const updatedEditor = await postgres.query(
      "UPDATE editor SET title = $1 WHERE id = $2",
      [title, editorId]
    )
    if (updatedEditor.rowCount !== 1) {
      throw new Error("Error while updating editor's title.")
    }
    res.status(201).json({ message: "Title updated" })
  } catch (error) {
    res.status(500).json(error)
  }
}
export default updateTitle
