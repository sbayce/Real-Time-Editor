import axios from "axios";

const getUser = async () => {
    try{
        const res = await axios.get("http://localhost:4000/user/me", {withCredentials: true})
        return res.data
    }catch(error){
        console.log(error)
    }
}

export default getUser