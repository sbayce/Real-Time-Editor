import html2canvas from "html2canvas"
import axios from "axios"
import { QueryClient } from "react-query"
import debounce from "lodash.debounce"

const storeImage = async (img: any, queryClient: QueryClient, editorId: string) => {
    try {
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/editor/set-snapshot/${editorId}`,
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
    const quill = document.querySelector(".ql-container.ql-snow") as HTMLElement
    if (!quill) return
    // hide all cursors to not appear in screenshot
    const cursors = quill.querySelectorAll(".cursor")
    const hightlights = quill.querySelectorAll('.highlight')
    cursors.forEach(cursor => cursor.classList.add('hidden'))
    hightlights.forEach(hightlight => hightlight.classList.add('hidden'))
    html2canvas(quill, {
      useCORS: true,
    })
      .then((canvas) => {
        // Reduce the image quality to lower the payload size
        const imageData = canvas.toDataURL('image/jpeg', 0.7); // Reduce quality to 70%
        storeImage(imageData, queryClient, editorId)
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