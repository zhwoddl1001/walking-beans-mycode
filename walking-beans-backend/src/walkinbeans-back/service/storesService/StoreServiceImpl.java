package walking_beans.walking_beans_backend.service.storesService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import walking_beans.walking_beans_backend.mapper.StoreMapper;
import walking_beans.walking_beans_backend.model.dto.Stores;
import walking_beans.walking_beans_backend.model.dto.rider.RiderMainStoreInfo;
import walking_beans.walking_beans_backend.service.FileStorageService;

import java.util.List;

@Service
public class StoreServiceImpl implements StoreService {

    // 이미지 저장 서비스 생성자 주입
    private final FileStorageService fileStorageService;

    public StoreServiceImpl(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @Autowired
    private StoreMapper storeMapper;


    //매장 전체 불러오기
    @Override
    public List<Stores> findAllStores() {
        return storeMapper.findAllStores();
            }

    //매장 검색
    @Override
    public List<Stores> searchStore(String keyword) {

        return storeMapper.searchStore(keyword);
    }


    //특정 매장 불러오기, ID
    @Override
    public Stores findStoresById(long storeId) {

        return storeMapper.findStoresById(storeId);
    }



    // 반경 10km 내의 매장 검색
    @Override
    public List<Stores> findNearbyStores(double lat, double lng) {
        return storeMapper.findNearbyStores(lat, lng, 10.0);
    }

}
