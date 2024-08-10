import { Request, Response } from "express"
import addCollaboratorToRedis from "../../lib/editor/add-collaborator-to-redis"

const inviteCollaborator = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const editorId = req.params.editorId
    const { email } = req.body

    const user = await postgres.query("SELECT * FROM users WHERE email = $1", [
      email,
    ])
    if (user.rowCount === 0) {
      res.status(400).json("User not found, cannot invite.")
      return
    }
    const collaborator = user.rows[0]
    const editorExists = await postgres.query(
      "SELECT * FROM editor WHERE id = $1",
      [editorId]
    )
    if (editorExists.rowCount === 0) {
      res.status(400).json("Editor does not exist.")
      return
    }

    const alreadyCollaborator = await postgres.query(
      "SELECT * FROM collaborator_access WHERE editor_id = $1 AND collaborator_id = $2",
      [editorId, collaborator.id]
    )
    if (alreadyCollaborator.rowCount === 1) {
      res.status(400).json("User is already a collaborator.")
      return
    }
    await postgres.query(
      "INSERT INTO collaborator_access (editor_id, collaborator_id, access_type) VALUES ($1, $2, $3) RETURNING *",
      [editorId, collaborator.id, "write"]
    )
    res.status(200).json("User invited.")
    // Prepare the new JSON object to append to editor
    // const collaboratorEntry = JSON.stringify([
    //   { userId: collaborator.id, permission: "write" },
    // ])

    // addCollaboratorToRedis(collaborator, editorId)

    // const alreadyCollaborator = await postgres.query(
    //   "SELECT * FROM editor WHERE id = $1 AND collaborators @> $2::jsonb",
    //   [editorId, collaboratorEntry]
    // )
    // if (alreadyCollaborator.rowCount === 1) {
    //   res.status(400).json("User is already a collaborator.")
    //   return
    // }
    // await postgres.query(
    //   "UPDATE editor SET collaborators = collaborators || $1::jsonb WHERE id = $2",
    //   [collaboratorEntry, editorId]
    // )
    
    // // Prepare the new JSON object to append to user's workspace
    // const newWorkspaceEntry = JSON.stringify([
    //   { editor_id: editorId, role: "collaborator" },
    // ])
    // // Update the user's workspace
    // await postgres.query(
    //   "UPDATE users SET workspace = workspace || $1::jsonb WHERE id = $2",
    //   [newWorkspaceEntry, collaborator.id]
    // )

    // res.status(200).json("User invited.")
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export default inviteCollaborator
