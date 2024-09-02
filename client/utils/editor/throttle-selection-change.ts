import { Socket } from "socket.io-client"

const throttle = (delay: number) => {
    let timerFlag: any
    let updatedSelectionIndex: number
    let updatedSelectionLength: number
    let updatedIndex: number
  
    return (selectionIndex: number, selectionLength: number, index: number, socket: Socket) => {
        if(!socket) return
        if(timerFlag){
            updatedSelectionIndex = selectionIndex
            updatedSelectionLength = selectionLength
            updatedIndex = index
            return
        }
        updatedSelectionIndex = selectionIndex
        updatedSelectionLength = selectionLength
        updatedIndex = index

      timerFlag = setTimeout(() => { 
        socket.emit("selection-change", {selectionIndex: updatedSelectionIndex, selectionLength: updatedSelectionLength, index: updatedIndex})
        console.log("sent selection.")
        timerFlag = null; 
      }, delay);
    };
  }

  const throttleSelectionChange = throttle(50)

  export default throttleSelectionChange