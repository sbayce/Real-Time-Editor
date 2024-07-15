import OnlineUser from "@/app/types/online-user"

const getUserColor = (onlineUsers: any, socketId: string) => {
    const user = onlineUsers?.find((user: OnlineUser) => user.socketId === socketId)
      if(user && user.color) return user.color
}
export default getUserColor