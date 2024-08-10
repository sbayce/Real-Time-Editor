import AccessType from "./access-type"

type Editor = {
    id: string
    title: string
    content: any
    created_at: string
    updated_at: string
    userEmail: string
    username: string
    accessType: AccessType
  }
export default Editor