import "./UserHome.css";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import apiStoreService from "../service/apiStoreService";
import apiUserService from "../service/apiUserService";
import sequence from "../assert/images/user/sequence.svg"
import searchIcon from "../assert/images/user/searchIcon.svg";
import oneStar from "../assert/svg/starNav/oneStar.svg";
import addressIcon from "../assert/images/user/addressIcon.svg";
import defaultimage from "../assert/images/user/defaultimage.svg"

const KAKAO_MAP_API_KEY = "1cfadb6831a47f77795a00c42017b581";

const UserHome = ({user: initialUser}) => {
    const [userLocation, setUserLocation] = useState(null);
    const [store, setStore] = useState([]);
    const [stores, setStores] = useState([]);
    const [displayStores, setDisplayStores] = useState([]);
    const [map, setMap] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [sortType, setSortType] = useState("rating");
    const navigate = useNavigate();
    const [user, setUser] = useState(initialUser || null);  // user 상태 초기화
    const [userAddress, setUserAddress] = useState(null);  // 주소 상태 관리
    const [userId, setUserId] = useState(null);  // userId 상태
    const [userLat, setUserLat] = useState(null);
    const [userLng, setUserLng] = useState(null);
    const [ratingStats, setRatingStats] = useState({average: 0, counts: [0, 0, 0, 0, 0]});
    const [reviews, setReviews] = useState([]);
    const [storeMenus, setStoreMenus] = useState({});

    // 로컬스토리지에서 사용자 정보 불러오기
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log("User 정보:", parsedUser);
            setUserId(parsedUser.user_id);  // userId 상태 설정
        } else {
            console.log("로그인되지 않았습니다.");
        }
    }, [localStorage.getItem("user")]);

    // 사용자의 주소 불러오기
    useEffect(() => {
        if (user && user.userId) {
            setUserId(user.userId);  // userId 상태 설정
        }
    }, [user]);  // user 상태가 변경될 때마다 실행

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserId(parsedUser.user_id);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // 기본주소 변경하는 함수
    const fetchPrimaryAddress = () => {
        apiUserService.primaryAddress(userId, setUserAddress, setUserLat, setUserLng);
    };

    useEffect(() => {
        if (userId) {
            fetchPrimaryAddress();
        }

        // 기본 주소가 변경되었는지 확인하고 다시 가져옴
        if (localStorage.getItem("addressUpdated") === "true") {
            localStorage.removeItem("addressUpdated");  // 플래그 초기화
            fetchPrimaryAddress();  // 새로고침 없이 기본 주소 다시 불러오기
        }

    }, [userId]);


    useEffect(() => {
        const handleAddressUpdate = () => {
            fetchPrimaryAddress();  // 기본 주소 다시 불러오기
        };

        window.addEventListener("addressUpdated", handleAddressUpdate);
        return () => {
            window.removeEventListener("addressUpdated", handleAddressUpdate);
        };
    }, []);

    // 매장 목록 가져오기
    useEffect(() => {
        apiStoreService.getStore(setStore);
    }, []);

    // 주소로 지도 가져오기
    useEffect(() => {
        const centerLat = userLat || userLocation?.lat;  // 대표 주소 없으면 현재 위치 사용
        const centerLng = userLng || userLocation?.lng;

        if (!centerLat || !centerLng) return; // 좌표가 없으면 실행 X

        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById("map");
                if (!mapContainer) return;

                const mapOption = {
                    center: new window.kakao.maps.LatLng(centerLat, centerLng),
                    level: 5,
                };
                const newMap = new window.kakao.maps.Map(mapContainer, mapOption);
                setMap(newMap);

                // 지도에 마커 추가
                new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(centerLat, centerLng),
                    map: newMap,
                    title: userLat && userLng ? "대표 주소" : "현재 위치"
                });
            });
        };

        return () => {
            document.head.removeChild(script);
        };
    }, [userLat, userLng, userLocation]);  //  대표 주소 변경될 때마다 실행

    // 사용자 위치 업데이트 (Geolocation API를 통해 현재 위치를 설정)
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log("사용자 위치를 가져오지 못했습니다.", error);
                }
            );
        } else {
            console.log("Geolocation을 지원하지 않는 브라우저입니다.");
        }
    }, []);

    // 리뷰 리스트 가져오기
    const fetchReviews = (storeId, callback) => {
        axios.get(`http://localhost:7070/api/reviews/${storeId}`)
            .then((res) => {
                const reviewsData = res.data;
                const totalScore = reviewsData.reduce((sum, review) => sum + review.reviewStarRating, 0);
                const average = reviewsData.length > 0 ? (totalScore / reviewsData.length).toFixed(1) : "0.0";
                const reviewCount = reviewsData.length; // 리뷰 개수 계산
                callback(average, reviewCount); // 평균 별점과 리뷰 개수를 함께 반환
            })
            .catch((err) => {
                console.error(`리뷰 정보를 불러오지 못했습니다. storeId: ${storeId}`, err);
                callback("0.0");
            });
    };

    // 별점 통계 업데이트
    const updateStoresWithRatings = (storesData) => {
        let updatedStores = [];
        let remainingStores = storesData.length;

        storesData.forEach((store) => {
            fetchReviews(store.storeId, (rating, reviewCount) => {
                updatedStores.push({
                    ...store,
                    storeRating: rating,
                    storeReviewCount: reviewCount
                });
                remainingStores--;

                if (remainingStores === 0) {
                    setStores(updatedStores);
                    setDisplayStores(updatedStores.slice(0, 5));
                }
            });
        });
    };

    //대표 주소(위도, 경도) 기반 매장 불러오기 함수 추가
    const fetchNearbyStores = (lat, lng) => {
        axios.get(`http://localhost:7070/api/store/nearby?lat=${lat}&lng=${lng}`)
            .then((res) => {
                console.log("📌 주변 매장 데이터:", res.data);
                setStores(res.data); // 매장 데이터 상태 업데이트
                updateStoresWithRatings(res.data)
            })
            .catch((error) => console.error("❌ 매장 정보 불러오기 오류:", error));
    };

    // 대표 주소가 설정되면 주변 매장 불러오기
    useEffect(() => {
        if (userLat && userLng) {
            fetchNearbyStores(userLat, userLng);
        }
    }, [userLat, userLng]); // 대표 주소 위도/경도가 변경될 때 실행

    //  가져온 매장에서 랜덤으로 5개 선택
    useEffect(() => {
        if (stores.length > 0) {
            const shuffled = [...stores].sort(() => 0.5 - Math.random()); // 랜덤 정렬
            setDisplayStores(shuffled.slice(0, 5)); // 최대 5개 선택
        }
    }, [stores]);

    useEffect(() => {
        console.log("받은 매장 데이터:", displayStores);
    }, [displayStores]);

    //  위도, 경도를 이용한 거리 계산 함수 (Haversine 공식)
    const getDistance = (lat1, lng1, lat2, lng2) => {
        if (!lat1 || !lng1 || !lat2 || !lng2) return Number.MAX_VALUE; // 좌표가 없으면 큰 값 반환

        const R = 6371; // 지구 반지름 (km)
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1)); // 숫자로 변환하여 반환
    };


    // 검색 기능
    const handleSearch = (e) => {
        apiStoreService.searchStore(e, searchKeyword, sortType, userLocation, (searchedStores) => {
            let updatedStores = [];
            let remainingStores = searchedStores.length

            searchedStores.forEach((store) => {
                fetchReviews(store.storeId, (rating, reviewCount) => {
                    const distance = getDistance(userLat, userLng, store.storeLatitude, store.storeLongitude); // 대표 주소 기준 거리 계산

                    updatedStores.push({
                        ...store,
                        storeRating: rating, // 리뷰 기반 별점 적용
                        storeReviewCount: reviewCount,
                        storeDistance: distance, // 대표 주소 기준 거리 저장
                    });

                    remainingStores--;
                    if (remainingStores === 0) {
                        //  10km 이내 매장만 필터링
                        let filteredStores = updatedStores.filter(store => store.storeDistance <= 10);

                        if (filteredStores.length === 0) {
                            alert("주변에 검색할 매장이 없습니다.");
                        }

                        //  정렬 로직 유지
                        if (sortType === "rating") {
                            filteredStores.sort((a, b) => b.storeRating - a.storeRating);
                        } else if (sortType === "distance") {
                            filteredStores.sort((a, b) => a.storeDistance - b.storeDistance);
                        }

                        setDisplayStores(filteredStores); //  최종 업데이트
                    }
                });
            });
        }, getDistance);
    };

    useEffect(() => {
        console.log("🔹 UI에 반영된 매장 데이터:", displayStores);
    }, [displayStores]);

    const handleMapClick = () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        if (!userLat || !userLng) {
            alert("대표 주소를 설정해 주세요.");
            return;
        }
        navigate("user/search/map", {state: {lat: userLat, lng: userLng}});
    };

    const handleUserAddress = () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        } else {
            navigate("/user/insertAddress")
        }
    }

    const handleStore = (storeId) => {
        if (!storeId) return; // storeId가 없으면 실행하지 않음
        navigate(`/store/${storeId}`);
    }

    // 순서 버튼
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("평점순");

    const options = [
        {value: "rating", label: "평점순"},
        {value: "distance", label: "거리순"},
    ];

    const handleSelect = (value, label) => {
        setSelected(label);
        setSortType(value);
        setIsOpen(false);
    }

// 특정 매장의 메뉴 가져오기 함수
    const fetchStoreMenus = (storeId) => {
        axios.get(`http://localhost:7070/api/menu/storemenu/${storeId}`)
            .then((res) => {
                setStoreMenus(prev => ({
                    ...prev,
                    [storeId]: res.data // 👈 매장 ID를 키로 저장!
                }));
            })
            .catch((err) => {
                console.error("매장 메뉴를 불러오는 중 오류:", err);
            });
    };

// 매장 데이터가 변경될 때 메뉴 데이터도 가져오기
    useEffect(() => {
        if (displayStores.length > 0) {
            // 각 매장의 메뉴 정보 가져오기
            displayStores.forEach(store => {
                fetchStoreMenus(store.storeId);
            });
        }
    }, [displayStores]);

    return (
        <div className="user-home-container">
            <div className="user-home-m">
                {/*주소를 보여줄 공간*/}
                <div>
                    <div className="user-order-bordtext mb-2"
                         onClick={handleUserAddress}
                         style={{cursor: "pointer"}}>
                        <img src={addressIcon}/>
                        {userAddress ? `${userAddress.address} ${userAddress.detailedAddress}` : "주소를 입력해주세요"}
                    </div>
                </div>

                {/*검색 공간*/}
                <div className="user-sequence-from">
                    <div className={`user-sequence-from-select ${isOpen ? "open" : ""}`}>
                        <div
                            className={`selected-option ${isOpen ? "open" : ""}`}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <img src={sequence} alt="icon"/>
                            {selected}
                        </div>
                        <ul className={`options ${isOpen ? "open" : ""}`}>
                            {options.map((option) => (
                                <li key={option.value} onClick={() => handleSelect(option.value, option.label)}>
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="input-group">
                            <img
                                src={searchIcon}
                                alt="search icon"
                                className="input-icon"
                            />
                            <input type="text"
                                   className="insert-address"
                                   placeholder="어떤 커피를 찾으시나요?"
                                   value={searchKeyword}
                                   onChange={(e) => setSearchKeyword(e.target.value)}
                                   onKeyDown={handleSearch}/>
                        </div>
                    </div>
                </div>

                <div className="user-order-bordtext mb-2">내 주변 카페 둘러보기</div>

                <div id="map" onClick={handleMapClick}></div>

                {/*매장 리스트*/}
                <div className="user-order-mt">
                    {displayStores.map((store, index) => {
                        const isLastItem = index === displayStores.length - 1;
                        // 이 매장의 메뉴 이미지 URL 가져오기
                        const menuImages = (storeMenus[store.storeId] || [])
                            .map((menu) => menu.menuPictureUrl)
                            .slice(0, 2);
                        return (
                            <div key={index} onClick={() => handleStore(store.storeId)}>
                                <div className="store-list">
                                    <div className="image-grid">
                                        <img className="store-image" src={store.storePictureUrl} alt="storeImage"/>
                                        {menuImages[0] && <img className="menu-image" src={menuImages[0]} alt="메뉴 이미지" />}
                                        {menuImages[1] && <img className="menu-image" src={menuImages[1]} alt="메뉴 이미지" />}
                                        {/*메뉴가 없을 시*/}
                                        {!menuImages[0] && <img className="menu-image" src={defaultimage} alt="메뉴 이미지 없음"/>}
                                        {!menuImages[1] && <img className="menu-image" src={defaultimage} alt="메뉴 이미지 없음"/>}
                                    </div>
                                    <div className="store-info">
                                        <div>
                                            <div className="store-title">{store.storeName}</div>
                                            <img src={oneStar} alt="별점 아이콘"/>
                                            <span
                                                className="rating-text">{store.storeRating}({Number(store.storeReviewCount).toLocaleString()})</span>
                                        </div>

                                        <div className="store-title">
                                            {userLat && userLng
                                                ? `${getDistance(userLat, userLng, store.storeLatitude, store.storeLongitude)}km`
                                                : "-"}
                                        </div>
                                    </div>
                                </div>
                                {!isLastItem && <div className="user-order-hr"></div>}
                            </div>
                        )
                    })
                    }
                </div>
            </div>
        </div>
    );
};

export default UserHome;
