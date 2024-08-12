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
      "SELECT * FROM user_access WHERE editor_id = $1 AND user_id = $2",
      [editorId, collaborator.id]
    )
    if (alreadyCollaborator.rowCount === 1) {
      res.status(400).json("User is already a collaborator.")
      return
    }
    await postgres.query(
      "INSERT INTO user_access (editor_id, user_id, access_type) VALUES ($1, $2, $3) RETURNING *",
      [editorId, collaborator.id, "write"]
    )
    res.status(200).json("User invited.")
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export default inviteCollaborator
