import Quill from "quill";

const handleKeyDown = (quills: Quill[], q: Quill, index: number, checkPageSize: any) => {
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
    
        switch (event.key) {
        case "ArrowDown":
            if (currentLine === lastLine && !checkPageSize(q, index)) moveToNextQuill();
            break;
        case "ArrowRight":
            if (currentLine === lastLine && currentSelection.index === q.getLength() - 1) moveToNextQuill();
            break;
        case "ArrowLeft":
            if (currentLine === firstLine && currentSelection.index === 0) moveToPrevQuill();
            break;
        case "ArrowUp":
            if (currentLine === firstLine) moveToPrevQuill();
            break;
        // case "Backspace":
        //     // if (q.getLength() === 1) moveToPrevQuill();
        //     break;
        }
    }
  }
  export default handleKeyDown