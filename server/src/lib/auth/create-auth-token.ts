import * as JWT from "jsonwebtoken"
import { AuthToken, AuthTokenType } from "../../types/auth-token"

const createAuthToken = (userId: string): AuthToken => {
  try {
    const accessToken = JWT.sign(
      { id: userId },
      String(process.env.ACCESS_SECRET),
      { expiresIn: process.env.ACCESS_EXPIRATION }
    )
    const refreshToken = JWT.sign(
      { id: userId },
      String(process.env.REFRESH_SECRET),
      { expiresIn: process.env.REFRESH_EXPIRATION }
    )
    return {
      accessToken,
      refreshToken,
      expiresIn: String(process.env.ACCESS_EXPIRATION),
      tokenType: AuthTokenType.BEARER,
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(e.message)
    }
    throw e
  }
}

export default createAuthToken
