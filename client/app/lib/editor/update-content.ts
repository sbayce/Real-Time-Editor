import axios from "axios"
const updateContent = async (textValue: string, editorId: string) => {
  await axios
    .post(
      `http://localhost:4000/editor/update-editor/${editorId}`,
      {
        content: textValue,
      },
      { withCredentials: true }
    )
    .then((res) => {
      return res.data
    })
    .catch((err) => {
      throw new Error(err)
    })
}

export default updateContent
