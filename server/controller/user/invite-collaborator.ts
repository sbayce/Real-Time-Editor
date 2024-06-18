import { Request, Response } from "express"

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
    // Prepare the new JSON object to append
    const collaboratorEntry = JSON.stringify([
      { userId: collaborator.id, permission: "write" },
    ])
    const alreadyCollaborator = await postgres.query(
      "SELECT * FROM editor WHERE id = $1 AND collaborators @> $2::jsonb",
      [editorId, collaboratorEntry]
    )
    if (alreadyCollaborator.rowCount === 1) {
      console.log("already exists")
      res.status(400).json("User is already a collaborator.")
      return
    }
    await postgres.query(
      "UPDATE editor SET collaborators = collaborators || $1::jsonb WHERE id = $2",
      [collaboratorEntry, editorId]
    )

    res.status(200).json("User invited.")
  } catch (error) {
    res.status(500).json(error)
  }
}

export default inviteCollaborator
