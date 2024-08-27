import { Socket } from "socket.io-client"

const renderQuills = (content: any, handleCreateQuill: Function, loadQuill: Function, socket: Socket) => {
    if(Object.entries(content).length === 0){
        console.log("will create quill..")
        handleCreateQuill(socket)
        return
    }
    for (const [key, value] of Object.entries(content)) {
        loadQuill(key, value)
    }
}
export default renderQuills