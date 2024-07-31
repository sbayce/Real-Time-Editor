const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000
    const diffInMinutes = diffInSeconds / 60
    const diffInHours = diffInMinutes / 60
    const diffInDays = diffInHours / 24
    const diffInWeeks = diffInDays / 7
    const diffInMonths = diffInDays / 30
    const diffInYears = diffInDays / 365
  
    if (diffInSeconds < 60) {
      return 'now'
    } else if (diffInMinutes < 60) {
        if(Math.floor(diffInMinutes) === 1) return `${Math.floor(diffInMinutes)} minute ago`
      return `${Math.floor(diffInMinutes)} minutes ago`
    } else if (diffInHours < 24) {
        if(Math.floor(diffInHours) === 1) return `${Math.floor(diffInHours)} hour ago`
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInDays < 7) {
        if(Math.floor(diffInDays) === 1) return `${Math.floor(diffInDays)} day ago`
      return `${Math.floor(diffInDays)} days ago`
    } else if (diffInWeeks < 4) {
        if(Math.floor(diffInWeeks) === 1) return `${Math.floor(diffInWeeks)} week ago`
      return `${Math.floor(diffInWeeks)} weeks ago`
    } else if (diffInMonths < 12) {
        if(Math.floor(diffInMonths) === 1) return `${Math.floor(diffInMonths)} month ago`
      return `${Math.floor(diffInMonths)} months ago`
    } else {
        if(Math.floor(diffInYears) === 1) return `${Math.floor(diffInYears)} year ago`
      return `${Math.floor(diffInYears)} years ago`
    }
  }
  
  export default formatDate
  