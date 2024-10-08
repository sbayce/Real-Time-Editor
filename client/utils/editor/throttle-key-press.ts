import Quill from "quill"
import { Delta } from "quill/core"
import { Socket } from "socket.io-client"
import isEqual from 'lodash.isequal'
import getEditorContent from "./get-editor-content"

const throttle = (delay: number) => {
    let timerFlag: any
    let deltas: Delta[] = []
    let invertedDelta: Delta | null = null

    const setIgnoredDelta = (value: Delta) => {
      if(timerFlag){
        if(invertedDelta) {
          invertedDelta = invertedDelta.compose(value)
        }else{
          invertedDelta = value
        }
      }
    }
    const cancelThrottle = () => {
      if(timerFlag){
        clearTimeout(timerFlag)
        timerFlag = null
        deltas = []
        invertedDelta = null
      }
    }
  
    const throttledKeyPress = (delta: Delta, quill: Quill, index: number, socket: Socket, oldDelta: Delta, setAreChangesSent: any, isMaster: boolean, quills: Quill[], setIsChanged: any) => {
      if(!socket) return
      if(timerFlag){
        if(invertedDelta){
          console.log("--------------IGNORE---------------------")
          console.log("inverted delta: ", invertedDelta)
          invertedDelta = delta.transform(invertedDelta, true)
          console.log("original delta: ", delta)
          const deltaIgnore = invertedDelta.transform(delta, true)
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
          const currentChanges = JSON.parse(JSON.stringify(oldDelta.compose(parentDelta)))

          if(!isEqual(currentChanges, oldContent)){ 
            socket.emit("send:changes", { delta: parentDelta, oldDelta, index })
            setAreChangesSent(true)
            // should refactor
            if(isMaster) {
              console.log("saving to DB...s")
              const content = getEditorContent(quills)
              console.log("current content to save: ", content)
              socket.emit("save:editor", content)
              setIsChanged(false)
            }
          }
          deltas = []
          invertedDelta = null
        }
        timerFlag = null
      }, delay);
    };
    return {
      throttledKeyPress,
      setIgnoredDelta,
      cancelThrottle
    }
  }

  const {throttledKeyPress, setIgnoredDelta, cancelThrottle} = throttle(500)

  export {throttledKeyPress, setIgnoredDelta, cancelThrottle}