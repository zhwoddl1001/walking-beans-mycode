import axios from "axios";

const API_STORE_URL = "http://localhost:7070/api/store";

const apiStoreService ={
    // 매장 정보 가져오기
    getStore:
    function (setStore){
        axios.get(API_STORE_URL)
            .then((res)=>{
                console.log("api 데이터", res.data);
                setStore(res.data);
            })
            .catch((err)=>{
                alert("백엔드에서 데이터를 가져오지 못했습니다.")
                console.log("err : ", err)
            })
    },
    // 매장 검색하기
    searchStore:
        function (e, searchKeyword, sortType, userLocation, setDisplayStores,getDistance) {
            if (e.key !== "Enter") return;  // ✅ Enter 키가 아닐 경우 실행 안 함

            return axios.get(`http://localhost:7070/api/store/search?keyword=${searchKeyword}`)
                .then((res) => {
                    console.table(res.data);
                    let sortedData = res.data.map(store => ({
                        ...store,
                        storeRating: store.storeRating ?? 0,
                        storeReviewCount: store.storeReviewCount ?? 0,
                        storeLatitude: store.storeLatitude ?? 0,
                        storeLongitude: store.storeLongitude ?? 0,
                        storeOperationHours: store.storeOperationHours ?? "운영시간 정보 없음",
                        storeStatus: store.storeStatus ?? "운영 상태 정보 없음",
                        storePhone: store.storePhone ?? "연락처 없음"
                    }));


                    setDisplayStores(sortedData);
                    return res;  // axios의 응답을 반환 (Promise 반환)
                })
                .catch((error) => {
                    console.error("❌ 검색 데이터를 가져오지 못했습니다.", error);
                    alert("검색 데이터를 가져오지 못했습니다.");
                });
    },




}
export default apiStoreService;