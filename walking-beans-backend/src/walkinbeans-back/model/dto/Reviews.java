package walking_beans.walking_beans_backend.model.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;

@ToString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Reviews {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    private Long orderId;

    private Long userId;

    private String userName;

    private Long storeId;

    private int reviewStarRating;

    private String reviewContent;

    private LocalDateTime reviewCreatedDate;  // 변경

    private LocalDateTime reviewModifiedDate;

    private String reviewPictureUrl;


}
