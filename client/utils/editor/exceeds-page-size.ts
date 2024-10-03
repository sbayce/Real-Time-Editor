import Quill from "quill"
const exceedsPageSize = (quill: Quill, quillIndex: number) => {
    if (!quill) return

    let pageSize = quill.root.clientHeight
    let sum = 0
    for (let i = 0; i < quill.root.children.length; i++) {
      sum += quill?.root.children[i].clientHeight
    }
    if (sum > pageSize - 50) {
      return true
    }
    return false
}
export default exceedsPageSize