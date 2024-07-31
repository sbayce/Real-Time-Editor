import React from "react"

const CustomToolbar = () => {
  return (
    <div id="toolbar" className="flex gap-2 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Font Size</label>
        <select className="ql-size border border-gray-300 rounded-sm ">
          <option value="10px">10</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px" selected>
            16
          </option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="30px">30</option>
          <option value="36px">36</option>
          <option value="48px">48</option>
          <option value="60px">60</option>
          <option value="72px">72</option>
        </select>
      </div>
      <select className="ql-header">
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
        <option value="5">Heading 5</option>
        <option value="6">Heading 6</option>
        <option value="false">Normal</option>
      </select>

      <select className="ql-color">
      <option value="rgb(0, 0, 0)">Black</option>
      <option value="rgb(230, 0, 0)">Red</option>
      <option value="rgb(255, 153, 0)">Orange</option>
      <option value="rgb(255, 255, 0)">Yellow</option>
      <option value="rgb(0, 138, 0)">Green</option>
      <option value="rgb(0, 102, 204)">Blue</option>
      <option value="rgb(153, 51, 255)">Purple</option>
      <option value="rgb(255, 255, 255)">White</option>
      <option value="rgb(250, 204, 204)">Light Red</option>
      <option value="rgb(255, 235, 204)">Light Orange</option>
      <option value="rgb(255, 255, 204)">Light Yellow</option>
      <option value="rgb(204, 232, 204)">Light Green</option>
      <option value="rgb(204, 224, 245)">Light Blue</option>
      <option value="rgb(235, 214, 255)">Light Purple</option>
      <option value="rgb(187, 187, 187)">Grey</option>
      <option value="rgb(240, 102, 102)">Dark Red</option>
      <option value="rgb(255, 194, 102)">Dark Orange</option>
      <option value="rgb(255, 255, 102)">Dark Yellow</option>
      <option value="rgb(102, 185, 102)">Dark Green</option>
      <option value="rgb(102, 163, 224)">Dark Blue</option>
      <option value="rgb(194, 133, 255)">Dark Purple</option>
      <option value="rgb(0, 0, 0)">Black</option>
      </select>

      <select className="ql-background">
      <option value="rgb(255, 255, 255)">White</option>
      <option value="rgb(250, 204, 204)">Light Red</option>
      <option value="rgb(255, 235, 204)">Light Orange</option>
      <option value="rgb(255, 255, 204)">Light Yellow</option>
      <option value="rgb(204, 232, 204)">Light Green</option>
      <option value="rgb(204, 224, 245)">Light Blue</option>
      <option value="rgb(235, 214, 255)">Light Purple</option>
      <option value="rgb(187, 187, 187)">Grey</option>
      <option value="rgb(240, 102, 102)">Dark Red</option>
      <option value="rgb(255, 194, 102)">Dark Orange</option>
      <option value="rgb(255, 255, 102)">Dark Yellow</option>
      <option value="rgb(102, 185, 102)">Dark Green</option>
      <option value="rgb(102, 163, 224)">Dark Blue</option>
      <option value="rgb(194, 133, 255)">Dark Purple</option>
      <option value="rgb(0, 0, 0)">Black</option>
      </select>

      <select className="ql-font">
        <option selected>Sans Serif</option>
        <option className="font-inter" value="inter">Inter</option>
        <option value="lexend">Lexend</option>
        <option className="font-roboto" value="roboto">Roboto</option>
        <option className="font-mirza" value="mirza">Mirza</option>
        <option value="arial">Arial</option>
        <option value="times-new-roman">Times New Roman</option>
      </select>

      <select className="ql-align">
        <option value="">Default</option>
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
        <option value="justify">Justify</option>
      </select>

      <button className="ql-bold">Bold</button>

      <button className="ql-italic">Italic</button>

      <button className="ql-underline">Underline</button>

      <button className="ql-strike">Strike</button>

      <button className="ql-blockquote">Blockquote</button>

      <button className="ql-code-block">Code Block</button>

      <button className="ql-link">Link</button>

      <button className="ql-image">Image</button>

      <button className="ql-video">Video</button>

      <button className="ql-formula">Formula</button>

      <button className="ql-list" value="ordered">
        Ordered List
      </button>
      <button className="ql-list" value="bullet">
        Bullet List
      </button>
      <button className="ql-list" value="check">
        Check List
      </button>

      <button className="ql-script" value="sub">
        Subscript
      </button>
      <button className="ql-script" value="super">
        Superscript
      </button>

      <button className="ql-indent" value="-1">
        Outdent
      </button>
      <button className="ql-indent" value="+1">
        Indent
      </button>

      <button className="ql-direction" value="rtl">
        RTL
      </button>

      <button className="ql-clean">Clean</button>
    </div>
  )
}

export default CustomToolbar
