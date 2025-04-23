package walking_beans.walking_beans_backend.controller;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import walking_beans.walking_beans_backend.model.dto.Address;
import walking_beans.walking_beans_backend.model.dto.Users;
import walking_beans.walking_beans_backend.service.addressService.AddressServiceImpl;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/addresses")
public class AddressAPIController {

    @Autowired
    private AddressServiceImpl addressService;


    @GetMapping
    public ResponseEntity<List<Address>> getAllAddresses() {
        List<Address> addresses = addressService.getAllAddresses();
        return ResponseEntity.ok(addresses);
    }
    // 로그인한 사용자의 주소 목록 조회
    @GetMapping("/loginAddresses")
    public List<Address> getLoginAddresses(HttpSession session) {
        Users user = (Users) session.getAttribute("user"); // 세션에 로그인한 사용자 정보 가져오기
        if (user == null) {
            throw new IllegalStateException("로그인이 필요합니다");
        }
        return addressService.getAddressByUserId(user.getUserId());
    }

    // 주소 추가
    @PostMapping("/UserInsertAddress")
    public String UserInsertAddress(@RequestBody Address address) {
        log.info("======= ====== {} ", address.toString());
        addressService.insertAddress(address);
        return "주소가 성공적으로 추가되었습니다.";
    }
    
    // 특정 userId의 주소 조회
    @GetMapping("/{userId}")
    public List<Address> getAddressByUserId(@PathVariable("userId") Long userId) {
        log.info("불러오는 userId: {}", userId); // 로그 추가
        return addressService.getAddressByUserId(userId);
    }

    // 대표 주소 설정
    @GetMapping("/primaryAddresses")
    public Address getPrimaryAddressByUserId(HttpSession session) {
        Users user = (Users) session.getAttribute("user"); // 세션에 로그인한 사용자 정보 가져오기
        if (user == null) {
            throw new IllegalStateException("로그인이 필요합니다");
        }
        Long userId = Long.parseLong(user.getUserName());
        return addressService.getPrimaryAddressByUserId(userId);
    }

    // 기본 주소 변경 (PUT 요청)
    @PutMapping("/updateRole")
    public String updatePrimaryAddress(@RequestBody Map<String, Long> request) {
        long userId = request.get("userId");
        long addressId = request.get("addressId");
        addressService.updatePrimaryAddress(userId,addressId);
        return "기본 주소가 변경되었습니다.";
    }

    // 주소 삭제
    @DeleteMapping("/delete/{addressId}")
    public ResponseEntity<String> deleteAddress(@PathVariable("addressId") Long addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok("주소가 삭제되었습니다.");
    }


    /**************************************** LEO ****************************************/

    /**
     * 유저 대표 주소 가져오기 by order_id
     * @param orderId : order id
     * @param userId : user id
     * @return : ResponseEntity.ok(Address)
     */
    @GetMapping("/main")
    public ResponseEntity<Address> getUserMainAddressByOrderId(@RequestParam("orderId") long orderId,
                                                      @RequestParam("userId") long userId){
        log.info("=== /api/addresses/userAddress?orderId={}&userId={} ===", orderId, userId);
        return ResponseEntity.ok(addressService.getUserMainAddress(orderId, userId));
    }

    /*************************************************************************************/

    // 주문 기준으로 사용자가 선택한 주소 가져오기
    @GetMapping("/user/order/{orderId}")
    public Address getUserAddressByOrderId(@PathVariable("orderId") long orderId){
        return addressService.getUserAddressByOrderId(orderId);
    }


}
