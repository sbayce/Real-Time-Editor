export enum AuthTokenType {
  BEARER = "Bearer",
}

export type AuthToken = {
  accessToken: string
  refreshToken: string
  expiresIn: string
  tokenType: AuthTokenType
}
