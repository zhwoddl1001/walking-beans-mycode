import React, {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import "../../../../../walking-beans-develop/walking-beans-frontend/src/css/User.css";
import userCurrentLocation from "../../../../../walking-beans-develop/walking-beans-frontend/src/assert/images/rider/userCurrentLocation.svg";
import axios from "axios";
import oneStar from "../../../../../walking-beans-develop/walking-beans-frontend/src/assert/svg/starNav/oneStar.svg";

const KAKAO_MAP_API_KEY = "1cfadb6831a47f77795a00c42017b581";

const UserSearchMap = () => {
    const location = useLocation();
    const {lat, lng, searchResults = []} = location.state || {};
    const mapRef = useRef(null);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const markersRef = useRef([]);
    const navigate = useNavigate();
    const infoWindowsRef = useRef([]);


    useEffect(() => {
        if (lat && lng) {
            sessionStorage.setItem("userLat", lat);
            sessionStorage.setItem("userLng", lng);
        }
    }, [lat, lng]);



    const fetchReviews = (storeId, callback) => {
        axios.get(`http://localhost:7070/api/reviews/${storeId}`)
            .then((res) => {
                const reviewsData = res.data;
                const totalScore = reviewsData.reduce((sum, review) => sum + review.reviewStarRating, 0);
                const average = reviewsData.length > 0 ? (totalScore / reviewsData.length).toFixed(1) : "0.0";
                const reviewCount = reviewsData.length;
                callback(average, reviewCount);
            })
            .catch((err) => {
                console.error(`❌ 리뷰 정보를 불러오지 못했습니다. storeId: ${storeId}`, err);
                callback("0.0", 0);
            });
    };


    const fetchNearbyStores = (lat, lng) => {
        axios.get(`http://localhost:7070/api/store/nearby?lat=${lat}&lng=${lng}`)
            .then((res) => {
                console.log(" 주변 매장 데이터:", res.data);

                let updatedStores = [];
                let remainingStores = res.data.length;

                if (remainingStores === 0) {
                    console.log("❌ 주변에 매장이 없습니다.");
                    setStores([]);
                    return;
                }

                res.data.forEach((store) => {
                    fetchReviews(store.storeId, (rating, reviewCount) => {
                        updatedStores.push({
                            ...store,
                            storeRating: rating,
                            storeReviewCount: reviewCount,
                        });

                        remainingStores--;
                        if (remainingStores === 0) {
                            setStores(updatedStores);
                        }
                    });
                });
            })
            .catch((error) => console.error("❌ 매장 정보 불러오기 오류:", error));
    };

// 카카오 지도 초기화
    useEffect(() => {
        if (!lat || !lng) return;

        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById("search-map");
                if (!mapContainer) return;

                const mapOption = {
                    center: new window.kakao.maps.LatLng(lat, lng),
                    level: 5,
                };
                const newMap = new window.kakao.maps.Map(mapContainer, mapOption);
                mapRef.current = newMap;

                //  사용자 위치 마커 추가
                const userMarkerImage = new window.kakao.maps.MarkerImage(
                    userCurrentLocation,
                    new window.kakao.maps.Size(40, 42),
                    {offset: new window.kakao.maps.Point(20, 42)}
                );

                new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(lat, lng),
                    map: newMap,
                    title: "내 위치",
                    image: userMarkerImage,
                });

                //  지도 생성 후 주변 매장 데이터 요청
                fetchNearbyStores(lat, lng);
            });
        };

        return () => {
            document.head.removeChild(script);
        };
    }, [lat, lng]); // `mapRef.current` 제거


    // 기존 마커를 지도에서 삭제하는 함수
    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
    };

    // 검색 결과로 나온 매장의 경우 stores에서 해당 매장을 찾아 상세 정보를 가져옴
    const handleMarkerClick = (store) => {
        const fullStoreData = stores.find(s => s.storeId === store.storeId) || store;

        fetchReviews(store.storeId, (rating, reviewCount) => {
            setSelectedStore({
                ...fullStoreData,
                storeRating: rating,
                storeReviewCount: reviewCount,
            });
        });

        mapRef.current.panTo(new window.kakao.maps.LatLng(store.storeLatitude, store.storeLongitude));
    };
    useEffect(() => {
        if (!mapRef.current) return;

        clearMarkers();

        const displayStores = searchResults.length > 0 ? searchResults : stores;
        console.log(" 지도에 표시할 매장 목록:", displayStores);

        displayStores.forEach((store) => {
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(store.storeLatitude, store.storeLongitude),
                map: mapRef.current,
            });

            const infoWindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px; font-size:12px; background:#fff; border-radius:5px;">${store.storeName}</div>`,
            });

            //  마커에 마우스를 올리면 매장 이름 표시
            window.kakao.maps.event.addListener(marker, "mouseover", () => {
                infoWindow.open(mapRef.current, marker);
            });

            window.kakao.maps.event.addListener(marker, "mouseout", () => {
                infoWindow.close();
            });

            //  마커 클릭 이벤트: 실시간 리뷰 반영
            window.kakao.maps.event.addListener(marker, "click", () => {
                infoWindow.close();
                handleMarkerClick(store);
            });

            markersRef.current.push(marker);
            infoWindowsRef.current.push(infoWindow);
        });
    }, [searchResults, stores]);

    //  매장 상세 정보 보기
    const handleStore = () => {
        if (!selectedStore?.storeId) return;
        navigate(`/store/${selectedStore.storeId}`);
    };


    return (
        <div className="user-search-map-container">
            <div id="search-map" className="search-map"></div>
            {selectedStore && (
                <div className="store-info" onClick={handleStore}>
                    <div className="store-modal">
                        <div className="user-order-hr" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStore(null);
                        }}></div>
                        <div className="info-grid">
                            <div>
                                <img className="store-picture" src={selectedStore.storePictureUrl} alt="매장 이미지"/>
                            </div>
                            <div>
                                <div className="status-btn-mini">{selectedStore.storeStatus} </div>
                                <div className="info-text-big">{selectedStore.storeName}</div>
                                <div className="info-text-bold">{selectedStore.storeDescription}</div>
                                <img src={oneStar}/>
                                <span
                                    className="info-text"> {selectedStore.storeRating} ({selectedStore.storeReviewCount})</span>
                                <div>
                                    <span className="info-text-bold">영업시간</span>
                                    <span className="info-text"> {selectedStore.storeOperationHours}</span>
                                </div>

                                <div>
                                    <span className="info-text-bold">주소</span>
                                    <span className="info-text"> {selectedStore.storeAddress}</span>
                                </div>

                                <div>
                                    <span className="info-text-bold">전화번호</span>
                                    <span className="info-text">
                                      {selectedStore.storePhone
                                          ? selectedStore.storePhone.replace(/^(\d{2})(\d{4})(\d{4})$/, " $1-$2-$3")
                                          : ""}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSearchMap;