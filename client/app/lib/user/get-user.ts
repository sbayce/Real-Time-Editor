import axios from "axios";

const getUser = async () => {
    try{
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`, {withCredentials: true})
        return res.data
    }catch(error){
        console.log(error)
    }
}

export default getUser