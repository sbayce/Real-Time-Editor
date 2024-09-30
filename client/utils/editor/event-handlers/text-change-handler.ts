import Quill from "quill"
import { Delta } from "quill/core"
import exceedsPageSize from "../exceeds-page-size"
import { createQuill } from "../create-quill"
import { Socket } from "socket.io-client"
import { throttledKeyPress } from "../throttle-key-press"
import debounceScreenShot from "../debounce-screenshot"
import updateLiveCursor from "../update-live-cursor"
import SelectionProperties from "@/app/types/SelectionProperties"

const textChangeHandler = (
    q: Quill, index: number, quills: Quill[], socket: Socket, setQuills: any, parent: any,
    selectionProperties: SelectionProperties[], setSelectionProperties: any, areChangesSent: boolean,
    setAreChangesSent: any, isMaster: boolean, setIsChanged: any, queryClient: any, editorId: string
) => {
    return (delta: Delta, oldDelta: Delta, source: string) => {
        if (source !== "user") return
        console.log(q.getContents())
        // check if new content increased page size beyond threshold
        if(exceedsPageSize(q, index)){
          //should cancel the changes and add a new page
          let isDelete = false
          delta.ops.forEach(op => {
            if(op.delete){
              isDelete = true
            }
          })
          if(!isDelete){
            q.updateContents(delta.invert(oldDelta), 'silent')
            if (quills[index + 1]) { //switch to page below if it exists
              setTimeout(() => {
                q.blur()
                quills[index + 1].focus()
              }, 0.1)
            } else {
              createQuill(socket, quills, setQuills, parent)
            }
          }
        }else{
          throttledKeyPress(delta, q, index, socket, oldDelta, setAreChangesSent, isMaster, quills, setIsChanged)
          if (index === 0) {
            debounceScreenShot(queryClient, editorId)
          }
          if(areChangesSent){
            setAreChangesSent(false)
          }
          if(isMaster) setIsChanged(true)
        }

        updateLiveCursor(delta, selectionProperties, setSelectionProperties, q, index, true)
      }
}
export default textChangeHandler