import Quill from "quill";

const getEditorContent = (quills: Quill[]) => {
    let content: any = {}
    quills.map((quill, index) => {
        content[index] = quill.getContents()
    })
    return content
}
export default getEditorContent