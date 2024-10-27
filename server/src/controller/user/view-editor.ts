import { Request, Response } from "express"

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
      res.status(404).json("Editor does not exist")
      return
    }
    let editor = editorExists.rows[0]

    let {rows: [foundUser]} = await postgres.query("SELECT * FROM user_access WHERE (editor_id, user_id) = ($1, $2)", [editorId, userId])
    if(!foundUser){
      res.status(403).json({ message: "User does not have access to this editor." })
      return
    }
  
    const {rows} = await postgres.query("SELECT email, username FROM users WHERE id = $1", [
      userId,
    ])
    const [user] = rows
    const userEmail = user.email
    const username = user.username

    res.status(201).json({ ...editor, userEmail: userEmail, username: username, isOwner: foundUser.isOwner })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
export default viewEditor
