import Quill from "quill"
import SelectionProperties from "@/app/types/SelectionProperties"

const changeCursorPosition = (selectionIndex: number, selectionLength: number, selectedQuill: Quill, selectionProperties: SelectionProperties[], senderSocket: string, index: number, setSelectionProperties: any) => {
    const startBounds = selectedQuill.getBounds(selectionIndex, selectionLength)
    let endBounds = startBounds
    if(selectionLength > 0){
      endBounds = selectedQuill.getBounds(selectionIndex + selectionLength, 0)
    }
    console.log("selected bounds: ", startBounds)
      if(selectionProperties.length > 0){
        let userSelectionAlreadyExists = false
        const updatedState = selectionProperties.map((selectionProperty: SelectionProperties) => {
          if(selectionProperty.socketId === senderSocket){
            userSelectionAlreadyExists = true
            return {index: selectionIndex, length: selectionLength, startBounds, endBounds, quillIndex: index, socketId: senderSocket}
          }else{
            return selectionProperty
          }
        })
        if(!userSelectionAlreadyExists){
          updatedState.push({index: selectionIndex, length: selectionLength, startBounds, endBounds, quillIndex: index, socketId: senderSocket})
        }
        setSelectionProperties(updatedState)
      }else{
        setSelectionProperties([{index: selectionIndex, length: selectionLength, startBounds, endBounds, quillIndex: index, socketId: senderSocket}])
      }
}
export default changeCursorPosition