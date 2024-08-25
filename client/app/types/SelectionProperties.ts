import { Bounds } from "quill"

type SelectionProperties = {
    index: number,
    length: number,
    startBounds: Bounds | null,
    endBounds: Bounds | null,
    quillIndex: number,
    socketId: string,
  }
  export default SelectionProperties