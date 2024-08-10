import { Pool } from "pg"

const checkAccessPermission = async (
  editor: any,
  userId: string | undefined,
  postgres: Pool
): Promise<boolean> => {
  if(editor.id === userId) return true
  const collaborator = await postgres.query("SELECT * FROM collaborator_access WHERE (editor_id, collaborator_id) = ($1, $2)", [editor.id, userId])
  if(collaborator.rowCount === 0) return false
  // Check if the user is the owner or a collaborator
  // const isOwner = editor.owner === userId
  // const isCollaborator = editor.collaborators.some((collaborator: any) => {
  //   return collaborator.userId === userId
  // })
  // return !(!isOwner && !isCollaborator)
  return true
}

export default checkAccessPermission
