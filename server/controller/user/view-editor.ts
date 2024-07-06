import { Request, Response } from "express"
import checkAccessPermission from "../../lib/editor/check-access-permission"
import redisClient from "../../redis"

const viewEditor = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const editorId = req.params.editorId
    let editor
    let editorContent
    let restData
    const cachedEditor: any = await redisClient.json.get(`editor:${editorId}`)
    if(!cachedEditor){
      const editorExists = await postgres.query(
        "SELECT * FROM editor WHERE id = $1",
        [editorId]
      )
      if (editorExists.rowCount === 0) {
        res.status(400).json("Editor does not exist")
        return
      }
      editor = editorExists.rows[0]
      console.log(editor)
      const hasAccessPermission = checkAccessPermission(editor, userId)
      if (!hasAccessPermission) {
        // redisClient.json.arrAppend(`user:${userId}`, "$", {[editorId]: false})
        res
          .status(403)
          .json({ message: "User is neither an owner nor a collaborator" })
        return
    }
      redisClient.json.set(`editor:${editorId}`, "$", editor)
      redisClient.expire(`editor:${editorId}`, 300)
    }else{
      editor = cachedEditor
      console.log("from cache")
      const {content, ...rest} = cachedEditor
      editorContent = content
      restData = rest
    }
  
    const user = await postgres.query("SELECT email FROM users WHERE id = $1", [
      userId,
    ])
    const userEmail = user.rows[0].email
    /* content is stored as JSON in redis and as STRING in posgres
       So pass the content as STRING if it's coming from redis
       The frontend accepts content as STRING
    */
    
    if(editorContent){
      let content = editorContent
      console.log("ok: ", content)
      res.status(201).json({ content, ...restData, userEmail: userEmail })
      return
    }
    res.status(201).json({ ...editor, userEmail: userEmail })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
export default viewEditor
