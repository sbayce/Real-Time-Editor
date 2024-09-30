import Quill from "quill";
import getEditorContent from "./get-editor-content";

const downloadPdf = async (quills: Quill[], editorId: string) => {
    const delta = getEditorContent(quills);
    console.log("all content:", delta);
    const response = await fetch(`/editor/${editorId}/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delta }),
    });
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'editor-content.pdf');
      document.body.appendChild(link);
      link.click();
    } else {
      console.error('Failed to generate PDF');
    }
}
export default downloadPdf