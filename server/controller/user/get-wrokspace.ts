import { Request, Response } from "express"

const getWorkspace = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const workspaceResult = await postgres.query(
      "SELECT workspace FROM users WHERE id = $1",
      [userId]
    )
    const workspace = workspaceResult.rows[0].workspace

    // Extract editor_ids
    let editors = workspace.map((item: any) => item.editor_id)
    // Query the editor table for these editor_ids
    const editorResult = await postgres.query(
      "SELECT * FROM editor WHERE id = ANY($1::int[])",
      [editors]
    )
    res.status(200).json(editorResult.rows)
  } catch (error) {
    res.status(500).json(error)
  }
}
export default getWorkspace
