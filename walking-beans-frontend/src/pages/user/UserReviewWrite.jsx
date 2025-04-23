import React, {useEffect, useState} from "react";
import axios from "axios";
import "../../css/User.css";
import "../../css/Order.css";
import groupIcon from "../../assert/svg/Group.svg"
import {useLocation, useNavigate, useParams} from "react-router-dom";
import XIcon from "../../assert/images/user/XIcon.svg"

const UserReviewWrite = () => {
    const [reviews, setReviews] = useState([]);
    const [riderReview, setRiderReview] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const location = useLocation();
    const {orderId} = useParams();
    const [userId, setUserId] = useState(null);
    const [storeId, setStoreId] = useState(location.state?.storeId || null);
    const [riderId, setRiderId] = useState(location.state?.riderId || null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [storeName, setStoreName] = useState('');
    const [newReview, setNewReview] = useState({
        orderId: orderId,
        userId: userId,
        storeId: storeId,
        reviewStarRating: 5,
        reviewContent: "",
    });
    const [newRiderReview, setNewRiderReview] = useState({
        orderId: orderId,
        riderId: riderId,
        riderReviewRating: 5,
    })
    /*  const [newRiderReview,setNewRiderReview] = useState({
          orderId: 123,
          riderId: 1,
          riderReviewRating: 5,
      })*/


    useEffect(() => {

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.user_id) {
            setNewReview((prevReview) => ({
                ...prevReview,
                userId: storedUser.user_id,
            }));
        }
    }, []);


    const handleStarClick = (rating) => {
        setNewReview((prevReview) => ({
            ...prevReview,
            reviewStarRating: rating,
        }));
    };


    const handleRiderStarClick = (rating) => {
        setNewRiderReview((prevReview) => ({
            ...prevReview,
            riderReviewRating: rating,
        }));
    };


    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const previewFiles = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setSelectedImages((prevImages) => [...prevImages, ...previewFiles]);
    };



    const removeImage = (index) => {
        setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };



    const handleReviewSubmit = (e) => {
        e.preventDefault();

        if (!newReview.reviewContent.trim()) {
            alert("리뷰를 입력해주세요.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("userId", newReview.userId);
        formData.append("storeId", newReview.storeId);
        formData.append("orderId", newReview.orderId);
        formData.append("reviewStarRating", newReview.reviewStarRating);
        formData.append("reviewContent", newReview.reviewContent);


        selectedImages.forEach((img) => {
            formData.append("file", img.file);
        });



        axios.post("http://localhost:7070/api/reviews", formData)
            .then(() => {
                return axios.post("http://localhost:7070/api/riderReview", newRiderReview);
            })
            .then(() => {
                alert("리뷰가 성공적으로 등록되었습니다!");
                navigate("/order");
                setNewReview((prevReview) => ({
                    ...prevReview,
                    reviewStarRating: 5,
                    reviewContent: "",
                }));
                setNewRiderReview((prevReview) => ({
                    ...prevReview,
                    riderReviewRating: 5,
                }));
                setSelectedImages([]);
            })
            .catch((err) => {
                console.error("리뷰 저장 실패", err);
                alert("백엔드에 리뷰를 저장하지 못했습니다.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (orderId) {
            axios.get(`http://localhost:7070/api/orders/${orderId}`)
                .then(res => {
                    setNewReview(prevReview => ({
                        ...prevReview,
                        orderId: orderId,
                        storeId: res.data.storeId,
                    }));
                    setNewRiderReview(prevReview => ({
                        ...prevReview,
                        orderId: orderId,
                        riderId: res.data.RiderIdOnDuty || null
                    }));
                })
                .catch(err => console.error("주문 정보 조회 실패:", err));
        }
    }, [orderId]);


    useEffect(() => {
        if (storeId) {
            axios.get(`http://localhost:7070/api/store/${storeId}`)
                .then(res => {
                    setStoreName(res.data.storeName);
                })
                .catch(err => console.error("가게 정보 조회 실패:", err));
        }
    }, [storeId]);

    return (
        <div className="user-review-container">
            <div className="review-all">
                <div className="review-info">
                    <div className="user-title-center">리뷰 작성하기</div>
                    <div className="user-order-hr"></div>

                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>리뷰를 등록하는 중입니다...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleReviewSubmit}>
                            <div className="star-rating">
                                <div className="user-order-bordtext">매장 별점 및 리뷰</div>
                                <div className="user-order-address-text">{storeName}</div>
                                <div className="star-container">
                                    {[...Array(5)].map((_, index) => (
                                        <span
                                            key={index}
                                            className={index < newReview.reviewStarRating ? "star filled" : "star"}
                                            onClick={() => handleStarClick(index + 1)}
                                        >
                                    ★
                                </span>
                                    ))}
                                </div>
                            </div>

                        {/* 리뷰 입력 */}
                        <textarea
                            placeholder="음식의 맛, 양, 포장 상태 등 음식에 대한 솔직한 리뷰를 남겨주세요."
                            value={newReview.reviewContent}
                            onChange={(e) =>
                                setNewReview((prevReview) => ({
                                    ...prevReview,
                                    reviewContent: e.target.value,
                                }))
                            }
                        />

                        <div className="file-upload-wrapper">
                            {/* 사진 추가 버튼 */}
                            <div className="file-upload">
                                <label htmlFor="file-input">
                                    <img src={groupIcon} alt="업로드" className="upload-icon"/>
                                </label>
                                <div className="btn-text">사진 추가</div>
                                <input id="file-input" type="file" accept="image/*" multiple
                                       onChange={handleFileChange}/>
                            </div>

                            {/* 이미지 미리보기 */}
                            <div className="image-preview-container">
                                {selectedImages.map((img, index) => (
                                    <div key={index} className="image-preview-wrapper">
                                        <div className="remove-image" onClick={() => removeImage(index)}>
                                            <img src={XIcon} alt="삭제 아이콘" className="remove-icon"/>
                                        </div>
                                        <img src={img.preview} alt={`미리보기 ${index}`} className="image-preview"/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="review-divider"></div>

                        {/* 라이더 별점 */}
                        <div className="star-rating">
                            <div className="user-order-bordtext">라이더 별점</div>
                            <div className="star-container">
                                {[...Array(5)].map((_, index) => (
                                    <span
                                        key={index}
                                        className={index < newRiderReview.riderReviewRating ? "star filled" : "star"}
                                        onClick={() => handleRiderStarClick(index + 1)}
                                    >
                                ★
                            </span>
                                ))}
                            </div>
                        </div>
                        <div className="button-center-wrapper">
                            <button type="submit" className="submit-button">작성하기</button>
                        </div>
                    </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserReviewWrite;