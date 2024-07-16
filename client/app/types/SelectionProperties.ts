import { Bounds } from "quill"

type SelectionProperties = {
    index: number,
    length: number,
    bounds: Bounds | null,
    quillIndex: number,
    socketId: string
  }
  export default SelectionProperties