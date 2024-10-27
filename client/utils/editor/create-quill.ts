import Quill from "quill"
import { Socket } from "socket.io-client"
import { toolbarOptions } from "@/app/lib/editor/quil-toolbar"
import { addTooltips } from "@/app/lib/editor/quil-toolbar"

const initializeQuill = (container: any, id: string) => {
    const editor = document.createElement("div")
    editor.style.border = "none"
    editor.id = `quill-${id}`
    container.appendChild(editor)
    const quillInstance = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: toolbarOptions, history: { userOnly: true } },
    })
    if(id !== '0'){
      const toolbar = quillInstance.getModule("toolbar") as { container: HTMLDivElement }
      toolbar.container.style.visibility = "hidden"
    }
    addTooltips(quillInstance)
    return quillInstance
  }

const createQuill = (socket: Socket | null, quills: Quill[], setQuills: any, parent: any) => {
    console.log(parent, quills, socket)
    if (parent && quills && socket) {
      const index = quills.length
      console.log("quill length: ", index)
      const newQuill = initializeQuill(parent, String(index))
      // auto-focus
      setTimeout(() => {
        newQuill.focus()
      }, 0)
      setQuills((prev: any) => [...prev, newQuill])
      socket.emit("add:page", { index })
    }
}
export { initializeQuill, createQuill }