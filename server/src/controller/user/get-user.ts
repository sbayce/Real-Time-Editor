import { Request, Response } from "express"

const getUser = async (req: Request, res: Response) => {
  try {
    const { postgres } = req.context
    const userId = req.userId
    const user = await postgres.query("SELECT email, username FROM users WHERE id = $1", [
        userId,
      ])
      if (user.rowCount === 0) {
        res.status(400).json("User not found")
        return
      }
    res.status(200).json(user.rows[0])
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
export default getUser
