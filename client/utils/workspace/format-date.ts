const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return "Created " + date.toLocaleDateString()
}
export default formatDate