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
    const hightlights = ql.querySelectorAll('.highlight')
    cursors.forEach(cursor => cursor.classList.add('hidden'))
    hightlights.forEach(hightlight => hightlight.classList.add('hidden'))
    html2canvas(ql, {
      useCORS: true,
    })
      .then((canvas) => {
        storeImage(canvas.toDataURL(), queryClient, editorId)
        // add cursors back
        cursors.forEach(cursor => cursor.classList.remove('hidden'))
        hightlights.forEach(hightlight => hightlight.classList.remove('hidden'))
      })
      .catch((err) => console.error("Error capturing screenshot:", err))
  }

  const debounceScreenShot = debounce((queryClient, editorId) => {
    captureScreenshot(queryClient, editorId)
  }, 5000)

  export default debounceScreenShot