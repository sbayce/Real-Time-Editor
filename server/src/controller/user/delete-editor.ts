import { Request, Response } from "express"

const deleteEditor = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const editorId = req.params.id
    const owner = await postgres.query("SELECT owner FROM editor WHERE owner = $1", [
      userId,
    ])
    if(owner.rowCount === 0){
      res.status(404).json("User is not the owner of this document.")
      return
    }
    const editor = await postgres.query("DELETE FROM editor WHERE id = $1", [
      editorId,
    ])
    if (editor.rowCount === 0) {
      res.status(400).json("Editor does not exist.")
      return
    }
    res.status(201).json("Editor deleted.")
  } catch (error) {
    res.status(500).json(error)
  }
}
export default deleteEditor
