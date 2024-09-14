import { Socket } from "socket.io-client";
const throttle = (delay: number) => {
    let timerFlag: any
    let currentValue = ""
  
    return (value: string, socket: Socket | null) => {
        if(!socket) return
        if(timerFlag){
            currentValue = value
            return
        }
        currentValue = value

      timerFlag = setTimeout(() => { 
        socket.emit("send:title", currentValue);
        timerFlag = null; 
        currentValue = ""
      }, delay);
    };
  }

  const throttleTitleChange = throttle(700)

  export default throttleTitleChange