import Quill from "quill"
import SelectionProperties from "@/app/types/SelectionProperties"

const updateLiveCursor = (delta: any, selectionProperties: SelectionProperties[] | null, setSelectionProperties: any, selectedQuill: Quill, quillIndex: number) => {
  if(!selectionProperties) return
  for(let i =0; i<selectionProperties.length; i++){
    const selectionProperty = selectionProperties[i]
    const selectionIndex = selectionProperty.index
    const selectionLength = selectionProperty.length
    const changes = delta.ops
        let isInsert = false
        let isDelete = false
        let retainValue = 0
        for(let j =0; j < changes.length; j++){
          const change = changes[j]
          console.log("here: ", change)
          if("retain" in change){
            retainValue = change.retain
            continue
          }
          if(retainValue){
            if("insert" in change && retainValue && retainValue < selectionIndex){
              isInsert = true
              const insertedValue = change.insert
              const valueLength = insertedValue.length
              console.log("inserted length: ", valueLength)
              const newIndex = selectionIndex + valueLength
              const newBounds = selectedQuill.getBounds(newIndex, selectionLength)
              const updatedState = [...selectionProperties]
              updatedState[i] = {index: newIndex, length: selectionLength, bounds: newBounds, quillIndex}
              setSelectionProperties(updatedState)
            }
            if("delete" in change && retainValue && retainValue < selectionIndex){
              isDelete = true
              const deletedLength = change.delete
              const newIndex = selectionIndex - deletedLength
              const newBounds = selectedQuill.getBounds(newIndex, selectionLength)
              const updatedState = [...selectionProperties]
              updatedState[i] = {index: newIndex, length: selectionLength, bounds: newBounds, quillIndex}
              setSelectionProperties(updatedState)
            }
          }
          
        }
  }
    
}
export default updateLiveCursor