
const renderQuills = (content: any, handleCreateQuill: Function, loadQuill: Function) => {
    if(Object.entries(content).length === 0){
        handleCreateQuill()
    }
    for (const [key, value] of Object.entries(content)) {
        loadQuill(key, value)
    }
}
export default renderQuills