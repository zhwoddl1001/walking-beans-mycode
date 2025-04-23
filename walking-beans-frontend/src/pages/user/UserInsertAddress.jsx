import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "../../css/User.css";
import searchIcon from "../../assert/images/user/searchIcon.svg"


const UserInsertAddress = ({user}) => {
    const navigate = useNavigate();
    const [address, setAddress] = useState("");
    const [detailedAddress, setDetailedAddress] = useState("");
    const [addressName, setAddressName] = useState("");
    const [currentUser, setCurrentUser] = useState(user);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
    const [addressLatitude, setLatitude] = useState("");
    const [addressLongitude, setLongitude] = useState("");

    const KAKAO_MAP_API_KEY = "5c03e27b386769b61889fd1f0650ec23";

    useEffect(() => {
        console.log("user props:", user);
        if (user) {
            setCurrentUser(user);
        } else {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setCurrentUser(parsedUser);
                    console.log("로컬스토리지에서 가져온 사용자 정보:", parsedUser);
                    fetchUserAddresses(parsedUser.userId);
                } catch (error) {
                    console.error("로컬스토리지 데이터 파싱 오류:", error);
                }
            }
        }
    }, [user]);

    useEffect(() => {
        const script1 = document.createElement("script");
        script1.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script1.async = true;
        document.body.appendChild(script1);

        const script2 = document.createElement("script");
        script2.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services,clusterer,drawing`;
        script2.async = true;
        script2.onload = () => {
            setIsKakaoLoaded(true);
            console.log("카카오 지도 API 로드 완료");
        };
        document.body.appendChild(script2);
    }, []);


    const fetchUserAddresses = (userId) => {
        if (!userId) return;

        axios
            .get(`http://localhost:7070/api/addresses/${userId}`)
            .then((res) => {
                setSavedAddresses(res.data);
                console.log("불러온 주소 목록:", res.data);
            })
            .catch((error) => {
                console.error("주소 목록 불러오기 오류:", error);
            });
    }
    useEffect(() => {
        const currentUserId = currentUser?.user_id || currentUser?.userId;
        if (currentUserId) {
            fetchUserAddresses(currentUserId);
        }
    }, [currentUser]);


    const handleSearchAddress = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setAddress(data.roadAddress);

                if (!isKakaoLoaded || !window.kakao || !window.kakao.maps) {
                    console.error("카카오 지도 API가 아직 로드되지 않았습니다.");
                    alert("카카오 지도 api 가 아직 로드 되지않았습니다.")
                    return;
                }


                const geocoder = new window.daum.maps.services.Geocoder();
                geocoder.addressSearch(data.roadAddress, function (result, status) {
                    if (status === window.daum.maps.services.Status.OK) {
                        const latitude = result[0].y;
                        const longitude = result[0].x;
                        console.log("위도:", latitude, "경도:", longitude);


                        setLatitude(latitude);
                        setLongitude(longitude);
                    } else {
                        console.error("좌표 변환 실패:", status);
                    }
                });
            },
        }).open();
    };


    const handleSaveAddress = () => {
        if (!address || !addressName) {
            alert("주소와 별칭을 입력해주세요!");
            return;
        }

        axios
            .post("http://localhost:7070/api/addresses/UserInsertAddress", {
                userId: currentUser?.user_id,
                addressName,
                address,
                detailedAddress,
                addressLatitude,
                addressLongitude,
            })
            .then((res) => {
                alert("주소가 저장되었습니다!");
                setAddress("");
                setAddressName("");
                setDetailedAddress("");
                fetchUserAddresses(currentUser?.user_id);
            })
            .catch((error) => {
                console.error("주소 저장 오류:", error);
                alert("주소 저장에 실패했습니다.");
            });
    };


    const handleSetPrimaryAddress = (addressId) => {
        axios.put(`http://localhost:7070/api/addresses/updateRole`, {
            userId: currentUser?.user_id,
            addressId: addressId
        })
            .then(() => {

                alert("기본 주소가 변경되었습니다.");

                localStorage.setItem("addressUpdated", "true");
                window.dispatchEvent(new Event("addressUpdated"));

                fetchUserAddresses(currentUser?.user_id);
            })
            .catch((error) => {
                console.error("기본 주소 변경 오류:", error);
                console.log("전송할 userId:", currentUser?.user_id);
                console.log("전송할 addressId:", addressId);
            });
    };

    const handleDeleteAddress = (addressId) => {
        if (!addressId) {
            alert("삭제할 주소 ID가 없습니다.");
            return;
        }

        axios.delete(`http://localhost:7070/api/addresses/delete/${addressId}`)
            .then(() => {
                alert("주소가 삭제되었습니다.");
                fetchUserAddresses(currentUser?.user_id);
            })
            .catch((error) => {
                console.error("주소 삭제 오류:", error);
                alert("주소 삭제에 실패했습니다.");
            });
    };

    return (
        <div className="user-insert-address-container">
            <div className="user-title-center">주소 설정</div>
            <div className="user-order-hr"></div>

            <div>
                <div className="input-group">
                    <img
                        src={searchIcon}
                        alt="search icon"
                        className="input-icon"
                        onClick={handleSearchAddress}
                    />
                    <input
                        type="text"
                        className="insert-address"
                        placeholder="주소를 입력해 주세요."
                        value={address}
                        readOnly
                        onClick={handleSearchAddress}
                    />
                </div>
                {address && (
                    <>
                        <input type="text" className="address-alias"
                               style={{flex: "0 0 60%"}}
                               placeholder="주소 별칭 (예: 집, 회사)"
                               value={addressName}
                               onChange={(e) => setAddressName(e.target.value)}/>

                        <input type="text" className="detailed-address"
                               placeholder="상세 주소 입력"
                               value={detailedAddress}
                               onChange={(e) => setDetailedAddress(e.target.value)}/>
                        <div className="button-container">
                            <button className="save-btn"
                                    onClick={handleSaveAddress}>
                                저장
                            </button>

                            <button className="cancel-btn"
                                    onClick={() => {
                                        setAddress("");
                                        setAddressName("");
                                        setDetailedAddress("");
                                    }}>
                                취소
                            </button>
                        </div>
                    </>
                )
                }


            </div>
            <div className="mt-3">
                {savedAddresses.map((addr, index) => {
                    const isLastItem = index === savedAddresses.length - 1;

                    return (
                        <div key={addr.id}>
                            <div onClick={() => handleSetPrimaryAddress(addr.addressId)}
                                 className="p-3 d-flex justify-content-between">
                                <div>
                                    <div className="address-grid">
                                    <div className="user-order-bordtext">{addr.addressName}</div>
                                    {addr.addressRole === 1 && <button className="btn-mini">기본 주소</button>}
                                    </div>
                                    <p className="user-order-address-text">{addr.address} {addr.detailedAddress}</p>
                                </div>
                                <button
                                    className="btn user-order-bordtext"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAddress(addr.addressId);
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                            {!isLastItem && <div className="user-order-hr-mini"></div>}
                        </div>
                    );
                })}
            </div>

            <div className="user-order-click-btn-one">
                <button className="user-order-btn-b" onClick={() => navigate(-1)}>선택 완료</button>
            </div>

        </div>
    );
};

export default UserInsertAddress;