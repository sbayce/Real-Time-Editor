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
    let ownedEditorsIds = workspace.map((item: any) => {
      if(item.role === "owner") return item.editor_id
    })
    let collaboratedEditorIds = workspace.map((item: any) => {
      if(item.role === "collaborator") return item.editor_id
    })
    // Query the editor table for these editor_ids
    const ownedEditors = await postgres.query(
      "SELECT id, title, created_at, updated_at FROM editor WHERE id = ANY($1::int[])",
      [ownedEditorsIds]
    )
    const collaboratedEditors = await postgres.query(
      "SELECT id, title, created_at, updated_at FROM editor WHERE id = ANY($1::int[])",
      [collaboratedEditorIds]
    )
    res.status(200).json({owned: ownedEditors.rows, collaborated: collaboratedEditors.rows})
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
export default getWorkspace
