import { Request, Response } from "express"

const createEditor = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const editor = await postgres.query(
      "INSERT INTO editor (owner) VALUES ($1) RETURNING *",
      [userId]
    )
    const editorId = editor.rows[0].id
    // Prepare the new JSON object to append
    const newWorkspaceEntry = JSON.stringify([
      { editor_id: editorId, role: "owner" },
    ])
    // Update the user's workspace
    await postgres.query(
      "UPDATE users SET workspace = workspace || $1::jsonb WHERE id = $2",
      [newWorkspaceEntry, userId]
    )
    res.status(201).json({ message: "Editor created" })
  } catch (error: any) {
    res.status(500).json(error.message)
  }
}
export default createEditor
