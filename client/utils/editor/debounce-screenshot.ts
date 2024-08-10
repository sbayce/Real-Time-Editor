import html2canvas from "html2canvas"
import axios from "axios"
import { QueryClient } from "react-query"
import debounce from "lodash.debounce"

const storeImage = async (img: any, queryClient: QueryClient, editorId: string) => {
    try {
      await axios
        .post(
          `http://localhost:4000/editor/set-snapshot/${editorId}`,
          { img },
          { withCredentials: true }
        )
        .then((res) => {
          console.log(res)
          queryClient.invalidateQueries("get-workSpace")
        })
    } catch (err) {
      console.error("Error storing image:", err)
    }
  }

const captureScreenshot = (queryClient: QueryClient, editorId: string) => {
    const ql = document.querySelector(".ql-container.ql-snow")
    if (!ql) return
    // hide all cursors to not appear in screenshot
    const cursors = ql.querySelectorAll(".cursor")
    for(let i =0; i<cursors.length; i++){
      cursors[i].classList.add("hidden")
    }
    html2canvas(ql, {
      useCORS: true,
    })
      .then((canvas) => {
        storeImage(canvas.toDataURL(), queryClient, editorId)
        // add cursors back
        for(let i =0; i<cursors.length; i++){
          cursors[i].classList.remove("hidden")
        }
      })
      .catch((err) => console.error("Error capturing screenshot:", err))
  }

  const debounceScreenShot = debounce((queryClient, editorId) => {
    captureScreenshot(queryClient, editorId)
  }, 5000)

  export default debounceScreenShot