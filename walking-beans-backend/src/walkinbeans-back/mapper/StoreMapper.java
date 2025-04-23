package walking_beans.walking_beans_backend.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import walking_beans.walking_beans_backend.model.dto.Stores;
import walking_beans.walking_beans_backend.model.dto.rider.RiderMainStoreInfo;

import java.util.List;

@Mapper
public interface StoreMapper {

    //매장 전체 불러오기
    List<Stores> findAllStores();

    //매장 검색
    List<Stores> searchStore(String keyword);

    //특정 매장 불러오기, ID
    Stores findStoresById(long storeId);


    // 반경 10km 내의 매장 검색
    List<Stores> findNearbyStores(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") double radius
    );

}
