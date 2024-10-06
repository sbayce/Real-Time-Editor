import Quill from "quill"
import { Delta } from "quill/core"
import isEqual from "lodash.isequal"
import updateLiveCursor from "../update-live-cursor"
import SelectionProperties from "@/app/types/SelectionProperties"
import calcLinesDiff from "@/utils/delta/calc-lines-diff"
import { setIgnoredDelta } from "../throttle-key-press"
import getEditorContent from "../get-editor-content"
import { Socket } from "socket.io-client"

const recieveChangeHandler = (
    isMaster: boolean, setIsChanged: any, quills: Quill[], selectionProperties: SelectionProperties[],
    setSelectionProperties: any, areChangesSent: boolean, socket: Socket
) => {
    return ({ delta, index, oldDelta } :{ delta: Delta, index: number, oldDelta: Delta}) => {
        console.log("got delta: ", delta.ops, "from index: ", index)
        if(isMaster) setIsChanged(true)
  
        const selectedQuill = quills[index]
        // create plain objects and remove prototypes (to check for equality of objects' structure)
        const senderContent = JSON.parse(JSON.stringify(oldDelta))
        const currentContent = JSON.parse(JSON.stringify(selectedQuill?.getContents()))
  
        if(isEqual(senderContent, currentContent)){
          console.log("without conflicts")
          selectedQuill.updateContents(delta)
  
          updateLiveCursor(delta, selectionProperties, setSelectionProperties, selectedQuill, index)
  
        }else{ 
          // should handle conflicts
          console.log("sender old: ", senderContent)
          console.log("current cont: ", currentContent)
          const difference = new Delta(oldDelta).diff(selectedQuill?.getContents())
          console.log("DIFF: ", difference)
          const diff = calcLinesDiff(oldDelta, selectedQuill?.getContents()) // each line diff
          console.log(diff)
  
          let actualTransform: any
          let transformed: any
          if(areChangesSent){
            transformed = difference?.transform(delta, true)
            actualTransform = diff?.transform(delta, true)
          }else{
            transformed = difference?.transform(delta, false)
            actualTransform = diff?.transform(delta, false)
          }
          console.log("transformed: ", transformed)
          console.log("actual transform: ", actualTransform);
          if(diff.ops.length === 0) {
            const invertedDelta = transformed.invert(selectedQuill.getContents())
            setIgnoredDelta(invertedDelta)
            selectedQuill.updateContents(transformed)
    
            updateLiveCursor(transformed, selectionProperties, setSelectionProperties, selectedQuill, index)
          }else{
            const invertedDelta = actualTransform.invert(selectedQuill.getContents())
            setIgnoredDelta(invertedDelta)
            selectedQuill.updateContents(actualTransform)
    
            updateLiveCursor(actualTransform, selectionProperties, setSelectionProperties, selectedQuill, index)
          }
          // const invertedDelta = transformed.invert(selectedQuill.getContents())
          // setIgnoredDelta(invertedDelta)
          // selectedQuill.updateContents(transformed)
  
          // updateLiveCursor(transformed, selectionProperties, setSelectionProperties, selectedQuill, index)
        }
        if(isMaster) {
          setTimeout(() => {
            console.log("saving to DB...r")
            const content = getEditorContent(quills)
            console.log("current content to save: ", content)
            socket.emit("save:editor", content)
            setIsChanged(false)
          }, 2000)
        }
      }
}
export default recieveChangeHandler