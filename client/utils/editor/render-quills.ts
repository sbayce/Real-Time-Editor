import { Socket } from "socket.io-client"
import { createQuill, initializeQuill } from "./create-quill"
import Quill from "quill"

const loadQuill = (id: string, content: any, setQuills: any, parent: any) => {
    if (parent) {
      const newQuill = initializeQuill(parent, id)
      setQuills((prev: any) => [...prev, newQuill])
      newQuill.setContents(content)
      newQuill.enable()
    //--old--
    //   if(editorData?.accessType === AccessType.Write){
    //     newQuill.enable()
    //   }else{
    //     newQuill.disable()
    //   }
    }
}

const renderQuills = (content: any, socket: Socket, quills: Quill[], setQuills: any, parent: any) => {
    if(Object.entries(content).length === 0){
        console.log("will create quill..")
        createQuill(socket, quills, setQuills, parent)
        return
    }
    for (const [key, value] of Object.entries(content)) {
        loadQuill(key, value, setQuills, parent)
    }
}
export default renderQuills