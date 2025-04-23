package walking_beans.walking_beans_backend.service.addressService;

import walking_beans.walking_beans_backend.model.dto.Address;

import java.util.List;
import java.util.Optional;

public interface AddressService {

    // 모든 주소 조회
    List<Address> getAllAddresses();

    // 주소 추가하기
    void insertAddress(Address address);

    // 주소 특정아이디로 검색
    List<Address> getAddressByUserId(Long userId);

    // 대표 주소 설정
    Address getPrimaryAddressByUserId(Long userId);

    // 대표 주소 변경
    void updatePrimaryAddress(long userId,long addressId);

    // 모든 주소 0으로 만들기
    void resetAddressRoles(long userId);

    // 주소 삭제
    void deleteAddress(long addressId);


    /********** LEO **********/
    // 유저 대표 주소 가져오기 by order_id
    Address getUserMainAddress(long orderId, long userId);

    // 주문 기준으로 사용자가 선택한 주소 가져오기
    Address getUserAddressByOrderId(long orderId);
}
