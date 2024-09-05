import Quill from "quill"
import SelectionProperties from "@/app/types/SelectionProperties"
import { Delta } from "quill/core"

const updateLiveCursor = (delta: Delta, selectionProperties: SelectionProperties[] | null, setSelectionProperties: any, selectedQuill: Quill, quillIndex: number, priority = false) => {
  if(!selectionProperties) return
  let updatedCursors = [...selectionProperties]
  for(let i =0 ;i< selectionProperties.length; i++){
    let cursor = selectionProperties[i]
    // skip if cursor is not in the same quill
    if(cursor.quillIndex !== quillIndex) continue

    let newIndex = new Delta(delta).transformPosition(cursor.index, priority)
    let newStartBounds = selectedQuill.getBounds(newIndex, cursor.length)
    let newEndBounds = selectedQuill.getBounds(newIndex + cursor.length, 0)
    if(newIndex === cursor.index){
      let newEndIndex = new Delta(delta).transformPosition(cursor.index + cursor.length, priority)
      newEndBounds = selectedQuill.getBounds(newEndIndex, 0)

      const lengthDifference = newEndIndex - (cursor.index + cursor.length)
      updatedCursors[i].length += lengthDifference
      newStartBounds = selectedQuill.getBounds(newIndex, updatedCursors[i].length)
    }
    updatedCursors[i].index = newIndex
    updatedCursors[i].startBounds = newStartBounds
    updatedCursors[i].endBounds = newEndBounds
  }
  setSelectionProperties(updatedCursors)
}
export default updateLiveCursor