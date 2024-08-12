import { Request, Response } from "express"

const createEditor = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const editor = await postgres.query(
      "INSERT INTO editor (owner) VALUES ($1) RETURNING id, title, created_at, updated_at",
      [userId]
    )
    const editorId = editor.rows[0].id
    await postgres.query("INSERT INTO user_access (editor_id, user_id, access_type, isOwner) VALUES ($1, $2, $3, $4)", [editorId, userId, "write", true])
    res.status(201).json(editor.rows[0])
  } catch (error: any) {
    res.status(500).json(error.message)
  }
}
export default createEditor
