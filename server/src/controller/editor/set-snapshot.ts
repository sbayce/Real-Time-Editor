import { Request, Response } from "express"
import cloudinary from "../../lib/cloudinary"

const setSnapShot = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const { img } = req.body
    const editorId = req.params.editorId

    const editorExists = await postgres.query(
      "SELECT * FROM editor WHERE id = $1",
      [editorId]
    )
    if (editorExists.rowCount === 0) {
      res.status(400).json("Editor does not exist")
      return
    }
    cloudinary.uploader.upload(img, {public_id: editorId}).then(async (result) => {
      const updatedEditor = await postgres.query(
        "UPDATE editor SET snap_shot = $1 WHERE id = $2",
        [result.secure_url, editorId]
      )
      if (updatedEditor.rowCount !== 1) {
        throw new Error("Error while updating editor's snapshot.")
      }
      res.status(201).json({ message: "Snapshot updated" })
    }
    )
  } catch (error) {
    res.status(500).json(error)
  }
}
export default setSnapShot
