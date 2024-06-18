const checkAccessPermission = (
  editor: any,
  userId: string | undefined
): boolean => {
  // Check if the user is the owner or a collaborator
  const isOwner = editor.owner === userId
  const isCollaborator = editor.collaborators.some((collaborator: any) => {
    return collaborator.userId === userId
  })
  return !(!isOwner && !isCollaborator)
}

export default checkAccessPermission
