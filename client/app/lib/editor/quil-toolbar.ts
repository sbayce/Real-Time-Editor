import { sizeWhitelist, fontWhitelist } from "./white-lists"
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

export default toolbarOptions
