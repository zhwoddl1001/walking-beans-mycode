import axios, {call} from "axios";

const USER_API_URL = "http://localhost:7070/api/users"

const apiUserService = {

    primaryAddress:
    function (userId,setUserAddress,setUserLat,setUserLng){
        if (userId) {
            axios.get(`http://localhost:7070/api/addresses/${userId}`)
                .then((res) => {
                    console.log("API 응답 데이터:", res.data);
                    const primaryAddress = res.data.find(addr => addr.addressRole === 1);
                    if (primaryAddress) {
                        setUserAddress(primaryAddress);
                        setUserLat(primaryAddress.addressLatitude);
                        setUserLng(primaryAddress.addressLongitude);
                    } else {
                        console.log("기본 주소가 없습니다.");
                    }
                })
                .catch((error) => {
                    console.error("주소 목록 불러오기 오류:", error);
                });
        }
    },


    sendEmailCode: function (email, callback, errorCallback) {
        axios
            .post(`${USER_API_URL}/sendCode`, { email })
            .then((res) => callback && callback(res.data))
            .catch((err) => errorCallback && errorCallback(err));
    },

    checkEmailCode: function (email, code, callback, errorCallback) {
        axios
            .post(`${USER_API_URL}/checkCode`, { email, code })
            .then((res) => callback && callback(res.data))
            .catch((err) => errorCallback && errorCallback(err));
    },



}

export default apiUserService;