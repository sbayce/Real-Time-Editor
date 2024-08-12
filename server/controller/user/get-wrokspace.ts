import { Request, Response } from "express"

const getWorkspace = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const workspaceResult = await postgres.query(
      "SELECT workspace FROM users WHERE id = $1",
      [userId]
    )
    const {rows} = await postgres.query("SELECT editor_id, isOwner FROM user_access WHERE user_id = $1", [userId])

    // Extract editor_ids
    let ownedEditorsIds: any[] = []
    let collaboratedEditorIds: any[] = []
    rows.map((item: any) => {
      if(item.isowner === true) ownedEditorsIds.push(item.editor_id)
    })
    rows.map((item: any) => {
      if(item.isowner === false) collaboratedEditorIds.push(item.editor_id)
    })
    console.log("owned: ", ownedEditorsIds)
    console.log("collabs: ", collaboratedEditorIds)
    // Query the editor table for these editor_ids
    const ownedEditors = await postgres.query(
      "SELECT id, title, created_at, updated_at, snap_shot FROM editor WHERE id = ANY($1::int[])",
      [ownedEditorsIds]
    )
    const collaboratedEditors = await postgres.query(
      "SELECT id, title, created_at, updated_at, snap_shot FROM editor WHERE id = ANY($1::int[])",
      [collaboratedEditorIds]
    )
    res.status(200).json({owned: ownedEditors.rows, collaborated: collaboratedEditors.rows})
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
export default getWorkspace
