package walking_beans.walking_beans_backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import walking_beans.walking_beans_backend.model.dto.Reviews;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ReviewMapper {
    // 특정 매장의 리뷰 조회
    List<Reviews> getReviewsByStore(long storeId);

    // 리뷰 추가
    void insertReview(Reviews review);

    // 리뷰 수정
    void updateReview(Reviews review);

    // 리뷰 삭제
    void deleteReview(long reviewId);
    Optional<Reviews> findReviewById(long reviewId);

    // 유저가 주문한 스토어에 대한 리뷰 존재 여부 확인
    boolean existsReviewByOrderId(long orderId);
}
