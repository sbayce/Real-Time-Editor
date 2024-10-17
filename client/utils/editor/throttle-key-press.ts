import Quill from "quill"
import { Delta } from "quill/core"
import { Socket } from "socket.io-client"
import isEqual from 'lodash.isequal'
import getEditorContent from "./get-editor-content"

const throttle = (delay: number) => {
    let timerFlag: any
    let deltas: Delta[] = []
    let invertedDelta: Delta | null = null
    let currPageIndex: number | null = null
    let currOldDelta: Delta | null = null

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
        currPageIndex = null
        currOldDelta = null
      }
    }

    const sendChanges = (quill: Quill, oldDelta: Delta, socket: Socket, setAreChangesSent: any, isMaster: boolean, quills: Quill[], setIsChanged: any) => {
      if(deltas.length !== 0){
        let parentDelta = deltas[0]
        for(let i =1; i < deltas.length; i++){
          parentDelta = parentDelta.compose(deltas[i])
        }
        console.log("composed delta: ", parentDelta)
        /* emit event if content change
           current != old --> change
           current == old --> no-change */
        const oldContent = JSON.parse(JSON.stringify(oldDelta))
        const currentChanges = JSON.parse(JSON.stringify(oldDelta.compose(parentDelta)))

        if(!isEqual(currentChanges, oldContent)){ 
          socket.emit("send:changes", { delta: parentDelta, oldDelta: currOldDelta, index: currPageIndex })
          setAreChangesSent(true)
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
    }
  
    const throttledKeyPress = (delta: Delta, quill: Quill, index: number, socket: Socket, oldDelta: Delta, setAreChangesSent: any, isMaster: boolean, quills: Quill[], setIsChanged: any) => {
      if(!socket) return
      if(timerFlag){
        if(currPageIndex !== null && currPageIndex !== index){
          clearTimeout(timerFlag)
          sendChanges(quill, oldDelta, socket, setAreChangesSent, isMaster, quills, setIsChanged)
          
          currPageIndex = index
          currOldDelta = oldDelta
          deltas.push(delta)
          timerFlag = setTimeout(() => { 
            sendChanges(quill, oldDelta, socket, setAreChangesSent, isMaster, quills, setIsChanged)
            timerFlag = null
            currPageIndex = null
            currOldDelta = null
          }, delay);

          return
        }
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
      currPageIndex = index
      currOldDelta = oldDelta
      deltas.push(delta)
      timerFlag = setTimeout(() => { 
        sendChanges(quill, oldDelta, socket, setAreChangesSent, isMaster, quills, setIsChanged)
        timerFlag = null
        currPageIndex = null
        currOldDelta = null
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