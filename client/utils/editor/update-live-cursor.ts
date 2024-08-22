import Quill from "quill"
import SelectionProperties from "@/app/types/SelectionProperties"
import { Delta } from "quill/core"

const updateLiveCursor = (delta: Delta, selectionProperties: SelectionProperties[] | null, setSelectionProperties: any, selectedQuill: Quill, quillIndex: number) => {
  if(!selectionProperties) return
  let updatedCursors = [...selectionProperties]
  for(let i =0 ;i< selectionProperties.length; i++){
    let cursor = selectionProperties[i]
    let newIndex = new Delta(delta).transformPosition(cursor.index)
    let newBounds = selectedQuill.getBounds(newIndex, cursor.length)
    updatedCursors[i].index = newIndex
    updatedCursors[i].bounds = newBounds
  }
  setSelectionProperties(updatedCursors)
}
export default updateLiveCursor