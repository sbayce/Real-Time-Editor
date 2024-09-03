import Quill from "quill"
import { Delta } from "quill/core"
import { Socket } from "socket.io-client"
import isEqual from 'lodash.isequal'

const throttle = (mainFunction: Function, delay: number) => {
    let timerFlag: any
    let deltas: Delta[] = []
    let invertedDelta: Delta | null = null

    const setIgnoredDelta = (value: Delta) => {
      if(timerFlag) invertedDelta = value
    }
  
    const throttledKeyPress = (delta: Delta, quill: Quill, index: number, socket: Socket, oldDelta: Delta, setPreviousDeltas: any, setAreChangesSent: any) => {
      if(!socket) return
      if(timerFlag){
        if(invertedDelta){
          console.log("--------------IGNORE---------------------")
          console.log("original delta: ", delta)
          const deltaIgnore = invertedDelta.transform(delta, true)
          console.log("original delta: ", delta)
          console.log("delta-ignore: ", deltaIgnore)
          deltas.push(deltaIgnore)
        }else{
          deltas.push(delta)
        }
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
          /* emit event if content change
             current != old --> change
             current == old --> no-change */
          const currentContent = JSON.parse(JSON.stringify(quill.getContents()))
          const oldContent = JSON.parse(JSON.stringify(oldDelta))
          if(!isEqual(currentContent, oldContent)){ 
            socket.emit("send-changes", { delta: parentDelta, oldDelta, index })
            setAreChangesSent(true)
          }
          // setPreviousDeltas((prevState: Delta[]) => {
          //   const newState = [...prevState]
          //   newState.splice(index, 1)
          //   return newState
          // })
          deltas = []
          invertedDelta = null
        }
        timerFlag = null; 
      }, delay);
    };
    return {
      throttledKeyPress,
      setIgnoredDelta
    }
  }

  const {throttledKeyPress, setIgnoredDelta} = throttle(() => {}, 500)

  export {throttledKeyPress, setIgnoredDelta}