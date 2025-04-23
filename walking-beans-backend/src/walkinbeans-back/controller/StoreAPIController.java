package walking_beans.walking_beans_backend.controller;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import walking_beans.walking_beans_backend.aspect.OwnershipCheck;
import walking_beans.walking_beans_backend.model.dto.Stores;
import walking_beans.walking_beans_backend.model.dto.rider.RiderMainStoreInfo;
import walking_beans.walking_beans_backend.service.FileStorageService;
import walking_beans.walking_beans_backend.service.orderService.OrderService;
import walking_beans.walking_beans_backend.service.orderService.OrderServiceImpl;
import walking_beans.walking_beans_backend.service.storesService.StoreServiceImpl;
import walking_beans.walking_beans_backend.service.userService.UserServiceImpl;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/store")
public class StoreAPIController {

    @Autowired
    private StoreServiceImpl storeService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private
    UserServiceImpl userService;

    /**매장 전체정보 불러오기
     * List<Stores>
     * @return ResponseEntity<List<Stores>>
     */
    @GetMapping
    public ResponseEntity<List<Stores>> findAllStores() {
        return ResponseEntity.ok(storeService.findAllStores());
    }

    /**특정 매장 불러오기
     *
     * @param storeId
     * @return Stores
     */
    @GetMapping("/{storeId}")
    public Stores findStoresById(@PathVariable("storeId") long storeId) {
        return storeService.findStoresById(storeId);
    }


    /** 메인메뉴에서 매장 검색
     *
     * @param keyword
     * @return
     */
    @GetMapping("/search")
    public List<Stores> searchStore(@RequestParam String keyword) {
        return storeService.searchStore(keyword);
    }

    /**
     * 사용자 위치(lat, lng) 기준으로 주변 매장 검색
     * @param lat
     * @param lng
     * @return
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<Stores>> findNearbyStores(
            @RequestParam double lat,
            @RequestParam double lng) {
        List<Stores> nearbyStores = storeService.findNearbyStores(lat, lng);
        return ResponseEntity.ok(nearbyStores);
    }

    @GetMapping("/address/orderId/{orderId}")
    public ResponseEntity<Stores> getStoreAddressByOrderId(@PathVariable("orderId") long orderId) {
        return ResponseEntity.ok(storeService.getStoreAddressByOrderId(orderId));
    }


    @GetMapping("/riderMain")
    public ResponseEntity<List<RiderMainStoreInfo>> getStoreInfoInRiderMain() {
        log.info("=== /api/store/riderMain ===");
        return ResponseEntity.ok(storeService.getStoreInfoInRiderMain());
    }
}

