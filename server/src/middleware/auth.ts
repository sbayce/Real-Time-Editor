import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import createAuthToken from "../lib/auth/create-auth-token"

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { postgres } = req.context
  const accessToken = req.cookies?.accessToken

  if (!accessToken) {
    const refreshToken = req.cookies?.refreshToken
    const accessTokenCookieDomain = process.env.ACCESS_TOKEN_COOKIE ?? ""

    if (!refreshToken) {
      return res.status(401).json({ message: "No token was found" })
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        String(process.env.REFRESH_SECRET)
      ) as {
        id: string
      }
      const user = await postgres.query("SELECT * FROM users WHERE id =$1", [
        decoded.id,
      ])
      if (user.rowCount === 0) {
        return res.status(401).json({ message: "User not found" })
      }
      // Generate a new access token
      const token = createAuthToken(decoded.id)
      res.cookie("accessToken", token.accessToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        domain: accessTokenCookieDomain,
      })
      req.userId = decoded.id
      return next()
    } catch (error) {
      console.log(error)
      return res.status(401).json({ message: "Invalid refresh token" })
    }
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      String(process.env.ACCESS_SECRET)
    ) as {
      id: string
    }
    req.userId = decoded.id
    const user = await postgres.query("SELECT * FROM users WHERE id =$1", [
      decoded.id,
    ])
    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }
    return next()
  } catch (error: any) {
    return res
      .status(401)
      .json({ message: "Invalid access token", error: error.message })
  }
}

export default isAuthenticated
