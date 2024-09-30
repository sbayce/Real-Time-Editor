import { Socket } from "socket.io-client"
import Quill from "quill"
import SelectionProperties from "@/app/types/SelectionProperties"

const removeQuill = (container: any, index: number, socket: Socket, quills: Quill[], setQuills: any, setSelectionProperties: any) => {
    if (!socket || !quills) return

    const quillElement = quills[index].container
    console.log("container", container)
    console.log("quill elem", quillElement)
    if(quillElement){
      container.removeChild(quillElement)
    }
    setQuills((prev: any) => {
      const newQuills = [...prev]
      newQuills.splice(index, 1)
      return newQuills
    })
    /* should remove cursors from target quill (that will be deleted)
       cursors from quills below target quill should shift their index -1
       cursors from quills above target quill should remain the same */

    setSelectionProperties((prev: SelectionProperties[]) => {
      const newSelectionProperties = prev.filter(selectionProperty => selectionProperty.quillIndex !== index)
      .map(selectionProperty => {
        if(selectionProperty.quillIndex > index){
          return {
            ...selectionProperty,
            quillIndex: selectionProperty.quillIndex-1
          }
        }else{
          return {...selectionProperty}
        }
      })
      // const newSelectionProperties = prev.filter(selectionProperty => selectionProperty.quillIndex !== index)
      console.log("NEW SELECTION PROPERTIES: ", newSelectionProperties)
      return newSelectionProperties
    })
}
export default removeQuill