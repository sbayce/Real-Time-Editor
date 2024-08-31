import { Request, Response } from "express"
import bcrypt from "bcrypt"
import createAuthToken from "../../lib/auth/create-auth-token"

const signin = async (req: Request, res: Response) => {
  try {
    const accessTokenCookieDomain = process.env.ACCESS_TOKEN_COOKIE ?? ""
    const { email, password } = req.body
    const { postgres } = req.context
    const existingUser = await postgres.query(
      "SELECT * FROM users WHERE email =$1",
      [email]
    )
    if (existingUser.rowCount === 0) {
      res.status(400).json("User not found.")
      return
    }
    const user = existingUser.rows[0]
    console.log(user)
    if (
      (await bcrypt.compare(password, existingUser.rows[0].password)) === false
    ) {
      res.status(400).json("Invalid password.")
      return
    }
    const token = createAuthToken(user.id)
    res.cookie("accessToken", token.accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      domain: accessTokenCookieDomain,
      sameSite: "none",
      secure: true
    })
    res.cookie("refreshToken", token.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      domain: accessTokenCookieDomain,
      sameSite: "none",
      secure: true
    })
    res.status(200).json({ token })
    
  } catch (error) {
    res.status(500).json(error)
  }
}
export default signin
