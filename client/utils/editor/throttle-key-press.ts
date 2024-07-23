import Quill from "quill"
import { Delta } from "quill/core"
import { Socket } from "socket.io-client"

const throttle = (mainFunction: Function, delay: number) => {
    let timerFlag: any
    let deltas: Delta[] = []
  
    return (delta: Delta, quill: Quill, index: number, socket: Socket) => {
      if(!socket) return
      if(timerFlag){
        deltas.push(delta)
        return
      }
      deltas.push(delta)
      timerFlag = setTimeout(() => { 
        if(deltas.length !== 0){
          let parentDelta = deltas[0]
          for(let i =1; i < deltas.length; i++){
            parentDelta = parentDelta.compose(deltas[i])
          }
          console.log("composed delta: ", parentDelta)
          const content = quill.getContents()
          socket.emit("send-changes", { delta: parentDelta, content, index })
          deltas = []
        }
        timerFlag = null; 
      }, delay);
    };
  }

  const throttledKeyPress = throttle(() => {}, 700)

  export default throttledKeyPress