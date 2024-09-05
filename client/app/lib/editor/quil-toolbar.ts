import { sizeWhitelist, fontWhitelist } from "./white-lists"
import Quill from "quill";

const toolbarOptions = [
  [{ font: fontWhitelist }],
  [{ size: sizeWhitelist }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],
  ["link", "image", "video", "formula"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ align: [] }],

  ["clean"], // remove formatting button
]

// Add tooltips after the toolbar has been initialized
const addTooltips = (quill: Quill) => {
  const toolbar = quill.getModule("toolbar") as { container: HTMLDivElement };
  const buttons = toolbar.container.querySelectorAll("button");
  const spans = toolbar.container.querySelectorAll("span");

  buttons.forEach((button) => {
    if (button.classList.contains("ql-bold")) {
      button.title = "Bold (Ctrl + B)";
    } else if (button.classList.contains("ql-italic")) {
      button.title = "Italic (Ctrl + I)";
    } else if (button.classList.contains("ql-underline")) {
      button.title = "Underline (Ctrl + U)";
    } else if (button.classList.contains("ql-strike")) {
      button.title = "Strikethrough";
    } else if (button.classList.contains("ql-blockquote")) {
      button.title = "Blockquote";
    } else if (button.classList.contains("ql-code-block")) {
      button.title = "Code Block";
    } else if (button.classList.contains("ql-link")) {
      button.title = "Insert Link";
    } else if (button.classList.contains("ql-image")) {
      button.title = "Insert Image";
    } else if (button.classList.contains("ql-video")) {
      button.title = "Insert Video";
    } else if (button.classList.contains("ql-formula")) {
      button.title = "Insert Formula";
    } else if (button.classList.contains("ql-clean")) {
      button.title = "Remove Formatting";
    } else if (button.classList.contains("ql-list")) {
      button.title = button.ariaLabel || "List";
    }
    // Add more buttons and tooltips as needed
  });

  // Tooltips for dropdowns (like font and size)
  spans.forEach((select) => {
    if (select.classList.contains("ql-font")) {
      select.title = "Font";
    } else if (select.classList.contains("ql-size")) {
      select.title = "Font Size";
    } else if (select.classList.contains("ql-header")) {
      select.title = "Header Size";
    } else if (select.classList.contains("ql-color")) {
      select.title = "Text Color";
    } else if (select.classList.contains("ql-background")) {
      select.title = "Background Color";
    }
    // Add more dropdowns and tooltips as needed
  });
};

export {toolbarOptions, addTooltips}
