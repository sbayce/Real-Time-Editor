import SelectionProperties from "@/app/types/SelectionProperties";
import getUserColor from "./get-user-color";
import OnlineUser from "@/app/types/online-user";

const renderLiveCursors = (selectionProperties: SelectionProperties[], onlineUsers: OnlineUser[] | null, wrapperElements: HTMLDivElement []) => {
    const divs: any[] =[]
      for(let i = 0; i< selectionProperties.length; i++){
        const selectionProperty = selectionProperties[i]
        const userColor = getUserColor(onlineUsers, selectionProperty.socketId)
        if(selectionProperty && selectionProperty.endBounds && selectionProperty.startBounds){
          const cursor = document.createElement('div');
          cursor.className = `absolute cursor`;
          cursor.style.backgroundColor = userColor
          cursor.style.top = `${Math.floor(selectionProperty.endBounds.top)}px`;
          cursor.style.left = `${Math.floor(selectionProperty.endBounds.left)}px`;
          cursor.style.right = `${Math.floor(selectionProperty.endBounds.right)}px`;
          cursor.style.bottom = `${Math.floor(selectionProperty.endBounds.bottom)}px`;
          cursor.style.height = `${Math.floor(selectionProperty.endBounds.height)}px`
          cursor.setAttribute('data-username', "sbaacce");

          const highlight = document.createElement('div');
          highlight.className = `absolute highlight`;
          highlight.style.backgroundColor = userColor
          highlight.style.top = `${Math.floor(selectionProperty.startBounds.top)}px`;
          highlight.style.left = `${Math.floor(selectionProperty.startBounds.left)}px`;
          highlight.style.right = `${Math.floor(selectionProperty.startBounds.right)}px`;
          highlight.style.bottom = `${Math.floor(selectionProperty.startBounds.bottom)}px`;
          highlight.style.height = `${Math.floor(selectionProperty.startBounds.height)}px`
          highlight.style.width = `${Math.floor(selectionProperty.startBounds.width)}px`

          // Append the div to the container
          const quillIndex = selectionProperty.quillIndex
          const ql = wrapperElements[quillIndex]
          ql.appendChild(cursor);
          ql.appendChild(highlight);
          divs.push({ cursor, ql, highlight });
        }
      }
      return divs
      
}
export default renderLiveCursors