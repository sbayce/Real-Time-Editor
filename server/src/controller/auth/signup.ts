import { Request, Response } from "express"
import bcrypt from "bcrypt"
import createAuthToken from "../../lib/auth/create-auth-token"

const signup = async (req: Request, res: Response) => {
  try {
    const accessTokenCookieDomain = process.env.ACCESS_TOKEN_COOKIE ?? ""
    const { username, email, password } = req.body
    const { postgres } = req.context
    const existingUser = await postgres.query(
      "SELECT * FROM users WHERE email =$1",
      [email]
    )
    if (existingUser.rowCount === 1) {
      res.status(400).json("User already exists.")
      return
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await postgres.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    )
    const token = createAuthToken(user.rows[0].id)
    res.cookie("accessToken", token.accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      // domain: accessTokenCookieDomain,
    })
    res.cookie("refreshToken", token.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      // domain: accessTokenCookieDomain,
    })
    res.status(200).json({ token })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export default signup
