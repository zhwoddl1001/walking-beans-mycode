package walking_beans.walking_beans_backend.service.reviewService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import walking_beans.walking_beans_backend.model.dto.Reviews;

import java.io.IOException;
import java.util.List;

public interface ReviewService {

    // 특정 매장의 리뷰 조회
    List<Reviews> getReviewsByStore(long storeId);

    // 리뷰 추가
    Reviews insertReview(Reviews review);

    // 리뷰 수정
    Reviews updateReview(long reviewId, Reviews review);

    // 리뷰 삭제
    void deleteReview(long reviewId);
    Reviews findReviewById(long reviewId);

    // 이미지 업로드
    String uploadToImgur(MultipartFile file) throws IOException;

    // 유저가 주문한 스토어에 대한 리뷰 존재 여부 확인
    boolean existsReviewByOrderId(long orderId);
}
