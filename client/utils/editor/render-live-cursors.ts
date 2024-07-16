import SelectionProperties from "@/app/types/SelectionProperties";
import getUserColor from "./get-user-color";
import OnlineUser from "@/app/types/online-user";

const renderLiveCursors = (selectionProperties: SelectionProperties[], onlineUsers: OnlineUser[] | null, wrapperElements: HTMLDivElement []) => {
    const divs: any[] =[]
      for(let i = 0; i< selectionProperties.length; i++){
        const selectionProperty = selectionProperties[i]
        const userColor = getUserColor(onlineUsers, selectionProperty.socketId)
        if(selectionProperty && selectionProperty.bounds){
          const div = document.createElement('div');
          div.className = `absolute w-1 h-5 animate-pulse`;
          div.style.backgroundColor = userColor
          div.style.top = `${Math.floor(selectionProperty.bounds.top)}px`;
          div.style.left = `${Math.floor(selectionProperty.bounds.left)}px`;
          div.style.right = `${Math.floor(selectionProperty.bounds.right)}px`;
          div.style.bottom = `${Math.floor(selectionProperty.bounds.bottom)}px`;

          // Append the div to the container
          const quillIndex = selectionProperty.quillIndex
          const ql = wrapperElements[quillIndex]
          ql.appendChild(div);
          divs.push({ div, ql });
        }
      }
      return divs
      
}
export default renderLiveCursors