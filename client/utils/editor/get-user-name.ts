import OnlineUser from "@/app/types/online-user"

const getUserName = (onlineUsers: any, socketId: string) => {
    const user = onlineUsers?.find((user: OnlineUser) => user.socketId === socketId)
      if(user && user.username) return user.username
}
export default getUserName