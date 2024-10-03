import { Request, Response } from "express"

const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: 'none'
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: 'none'
        });
      res.status(200).json("Logged out.");
    } catch (err) {
      res.status(500).json(err);
    }
  };
  
  export default logout;