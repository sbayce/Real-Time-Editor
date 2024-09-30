import Quill, { Range } from "quill"
import throttleSelectionChange from "../throttle-selection-change"
import { Socket } from "socket.io-client"

const selectionChangeHandler = (q: Quill, index: number, socket: Socket) => {
    return (range: Range, oldRange: Range, source: string) => {
        if (!range) return
        const toolbars = document.querySelectorAll(".ql-toolbar.ql-snow")
        toolbars.forEach(toolbar => {
          (toolbar as HTMLElement ).style.visibility = "hidden"
        })
        const toolbar = q.getModule("toolbar") as { container: HTMLDivElement }
        toolbar.container.style.visibility = "visible"

        const selectionLength = range.length
        const selectionIndex = range.index
        throttleSelectionChange(selectionIndex, selectionLength, index, socket)
      }
}
export default selectionChangeHandler