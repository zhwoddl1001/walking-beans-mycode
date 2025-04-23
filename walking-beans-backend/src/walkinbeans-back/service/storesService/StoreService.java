package walking_beans.walking_beans_backend.service.storesService;

import org.springframework.web.multipart.MultipartFile;
import walking_beans.walking_beans_backend.model.dto.Stores;
import walking_beans.walking_beans_backend.model.dto.rider.RiderMainStoreInfo;

import java.util.List;

public interface StoreService {

    //매장 전체 불러오기
    List<Stores> findAllStores();

    //매장 검색
    List<Stores> searchStore(String keyword);

    //특정 매장 불러오기, ID
    Stores findStoresById(long storeId);

    // 위도경도 10km 매장
    List<Stores> findNearbyStores(double lat, double lng);

}
