import Quill from "quill";
import { Socket } from "socket.io-client";
import removeQuill from "./remove-quill";
import { cancelThrottle } from "./throttle-key-press";

const handleKeyDown = (quills: Quill[], setQuills: any, setSelectionProperties: any, q: Quill, index: number, exceedsPageSize: any, socket: Socket, parent: any) => {
    return (event: any) => {
        console.log("Key down.")
        const currentSelection = q.getSelection();
        if (!currentSelection) return;
    
        const [currentLine] = q.getLine(currentSelection.index);
        const lastLine = q.getLines().at(-1);
        const firstLine = q.getLines().at(0);
    
        const nextQuill = quills[index + 1];
        const prevQuill = quills[index - 1];
    
        const moveToNextQuill = () => setTimeout(() => nextQuill?.setSelection(0), 0);
        const moveToPrevQuill = () => setTimeout(() => prevQuill?.setSelection(prevQuill.getLength()), 0);
        const moveAndDelete = () => setTimeout(() => {
            q.blur()
            removeQuill(parent, index, socket, quills, setQuills, setSelectionProperties)
            cancelThrottle()
            socket.emit("remove:page", index)
            prevQuill.setSelection(prevQuill.getLength())
        }, 0)
    
        switch (event.key) {
        case "ArrowDown":
            if (currentLine === lastLine && !exceedsPageSize(q, index)) moveToNextQuill();
            break;
        case "ArrowRight":
            if (currentLine === lastLine && currentSelection.index === q.getLength() - 1) moveToNextQuill();
            break;
        case "ArrowLeft":
            if (currentLine === firstLine && currentSelection.index === 0) moveToPrevQuill();
            break;
        case "ArrowUp":
            if (currentLine === firstLine && index > 0){
                    moveToPrevQuill()    
            }
            break;
        case "Backspace":
            if(index === 0) break
            if (q.getLength() === 1) {
                moveAndDelete()
            }
            if(currentLine === firstLine && currentSelection.index === 0 && q.getLength() > 1){
                moveToPrevQuill()
            }
            break;
        }
    }
  }
  export default handleKeyDown