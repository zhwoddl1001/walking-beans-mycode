import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../css/User.css"; // CSS 경로 확인

const UserStoreReview = () => {
    const { storeId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [storeName, setStoreName] = useState(""); // 매장 이름 저장
    const [ratingStats, setRatingStats] = useState({ average: 0, counts: [0, 0, 0, 0, 0] });
    const [userId, setUserId] = useState(null); // ✅ 로그인된 사용자 ID 저장


    useEffect(() => {
        //  localStorage에서 사용자 정보 가져오기
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.user_id) {
            setUserId(storedUser.user_id); // ✅ 로그인한 userId 설정
        } else {
            console.warn("로그인한 사용자의 userId를 찾을 수 없습니다.");
        }

        if (!storeId) return;
        fetchStoreInfo();
        fetchReviews();
    }, [storeId]);

    // 매장 정보 불러오기
    const fetchStoreInfo = () => {
        axios.get(`http://localhost:7070/api/store/${storeId}`)
            .then((res) => setStoreName(res.data.storeName))
            .catch((err) => console.error("매장 정보를 불러오지 못했습니다.", err));
    };

    // 리뷰 리스트 가져오기
    const fetchReviews = () => {
        axios.get(`http://localhost:7070/api/reviews/${storeId}`)
            .then((res) => {
                const reviewsData = res.data;
                setReviews(reviewsData);
                updateRatingStats(reviewsData);
                console.log("유저 이름 가져오는지 테스트 : "+reviewsData)
            })
            .catch((err) => console.error("리뷰 정보를 불러오지 못했습니다.", err));
    };

    // 별점 통계 업데이트
    const updateRatingStats = (reviewsData) => {
        const ratingCounts = [0, 0, 0, 0, 0];
        let totalScore = 0;

        reviewsData.forEach((review) => {
            const rating = review.reviewStarRating;
            ratingCounts[rating - 1] += 1;
            totalScore += rating;
        });

        const average = reviewsData.length > 0 ? (totalScore / reviewsData.length).toFixed(1) : 0;
        setRatingStats({ average, counts: ratingCounts });
    };

    // 리뷰 삭제 함수
    const handleDeleteReview = (reviewId) => {
        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;

        axios.delete(`http://localhost:7070/api/reviews/${reviewId}`, {
            data: { userId },
            headers: { "Content-Type": "application/json" },
        })
            .then(() => {
                alert("리뷰가 삭제되었습니다.");
                fetchReviews();
            })
            .catch((err) => {
                console.error("리뷰 삭제 실패:", err);
                alert("리뷰 삭제 중 오류가 발생했습니다.");
            });
    };

    return (
        <div className="user-store-review">
            <h2>{storeName} 리뷰</h2>
            {/* 리뷰 통계 바 */}
            <div className="review-summary">
                <div className="average-rating">
                    <span className="big-star">★</span> <span className="average-score">{ratingStats.average}</span>
                </div>
                <div className="rating-bars">
                    {[5, 4, 3, 2, 1].map((star, index) => (
                        <div key={star} className="rating-row">
                            <span className="star-text">{star}점</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${(ratingStats.counts[4 - index] / reviews.length) * 100 || 0}%`,
                                    }}
                                ></div>
                            </div>
                            <span className="count-text">{ratingStats.counts[4 - index]}명</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="review-list">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.reviewId} className="review-card">
                            <div className="review-header">
                                <span className="review-user">{review.userName || "익명"}</span>
                                <div className="review-right">
                                    <span className="review-date">{review.reviewCreatedDate?.split("T")[0]}</span>
                                    {userId === review.userId && (
                                        <button className="delete-review-btn" onClick={() => handleDeleteReview(review.reviewId)}>
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="review-stars">
                                {"★".repeat(review.reviewStarRating)}{"☆".repeat(5 - review.reviewStarRating)}
                            </div>
                            <p className="review-content">{review.reviewContent}</p>
                            {review.reviewPictureUrl && review.reviewPictureUrl.split(",").map((url, idx) => (
                                <img key={idx} src={url.trim()} alt={`리뷰 이미지 ${idx}`} className="review-image" />
                            ))}

                        </div>
                    ))
                ) : (
                    <p className="no-reviews">아직 등록된 리뷰가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default UserStoreReview;