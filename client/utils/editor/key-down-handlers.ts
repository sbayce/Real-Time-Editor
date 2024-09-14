import Quill from "quill";
import { Socket } from "socket.io-client";

const handleKeyDown = (quills: Quill[], q: Quill, index: number, exceedsPageSize: any, removeQuill: any, cancelThrottle: any, socket: Socket, parent: any) => {
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
            removeQuill(parent, index)
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
                    // const selection = q.getSelection()
                    // if (selection) {
                    //     // Get the bounds of the current cursor position
                    //     const bounds = q.getBounds(selection.index);
                    //     console.log("bounds: ", bounds)
                  
                    //     if (bounds) {
                    //       // Get the toolbar element
                    //     //   const toolbar = document.querySelector('.ql-toolbar') as HTMLElement | null;
                    //       const toolbar = q.getModule("toolbar") as { container: HTMLElement }
                  
                    //       if (toolbar) {
                    //         const toolbarHeight = toolbar.container.offsetHeight;
                  
                    //         // Check if the cursor is above the toolbar
                    //         const cursorPosition = bounds.top;
                    //         const editorTop = q.root.getBoundingClientRect().top;
                  
                    //         // Check if the cursor is going out of view due to the toolbar overlap
                    //         console.log(cursorPosition, toolbarHeight)
                    //         if (cursorPosition < toolbarHeight) {
                    //           // Scroll to the position where the cursor should be visible, center-aligned
                    //           console.log("scroll")
                    //           prevQuill.root.scrollIntoView({ block: 'center', behavior: 'smooth' })
                    //         //   moveToPrevQuill()
                    //         }
                    //       }
                    //     }
                    //   }
                
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