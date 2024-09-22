import React from 'react'
import OnlineUser from '@/app/types/online-user'
import { Avatar, Chip } from '@nextui-org/react'

const OnlineUsersList = ({ onlineUsers }: { onlineUsers: OnlineUser[] | null }) => {
  if (!onlineUsers) return <></>

  return (
    <div className="flex flex-col gap-2 w-56 absolute right-0 lg:right-6 xl:right-10">
      <h1>Online Collaborators</h1>
      {onlineUsers.map((user: OnlineUser) => {
        return (
          <Chip key={user.socketId} variant="light">
            <div className="flex items-center gap-1 w-56">
              <Avatar
                size="sm"
                style={{ borderColor: user.color }}
                className="border-2 w-6 h-6 p-2"
                name={user.username}
                getInitials={(name) => name.charAt(0)}
              />
              <p className="truncate w-full">{user.username}</p>
            </div>
          </Chip>
        )
      })}
    </div>
  )
}

export default OnlineUsersList
