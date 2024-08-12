import { Request, Response } from "express"
import checkAccessPermission from "../../lib/editor/check-access-permission"
import redisClient from "../../redis"

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
      res.status(400).json("Editor does not exist")
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
    /* content is stored as JSON in redis and as STRING in posgres
       So pass the content as STRING if it's coming from redis
       The frontend accepts content as STRING
    */
    
    res.status(201).json({ ...editor, userEmail: userEmail, username: username, accessType: foundUser.access_type, isOwner: foundUser.isOwner })
    console.log("found user: ", foundUser)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
export default viewEditor
