import redisClient from "../../redis";

const addCollaboratorToRedis = async (collaborator: any, editorId: string) => {
    const redisCollaboratorEntry = { userId: collaborator.id, permission: "write" }
    const currentCollaborators: any = await redisClient.json.get(`editor:${editorId}`, {path: `$.collaborators`})
    // check if editor available on redis
    if(currentCollaborators){
      const exists = currentCollaborators[0].some((entry: any) => JSON.stringify(entry) === JSON.stringify(redisCollaboratorEntry))
      if(!exists){
        await redisClient.json.arrAppend(`editor:${editorId}`, "$.collaborators", redisCollaboratorEntry);
      }
    }
}

export default addCollaboratorToRedis
