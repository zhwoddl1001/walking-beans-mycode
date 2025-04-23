package walking_beans.walking_beans_backend.service.addressService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import walking_beans.walking_beans_backend.mapper.AddressMapper;
import walking_beans.walking_beans_backend.model.dto.Address;

import java.util.List;
import java.util.Optional;

@Service
public class AddressServiceImpl implements AddressService {
    @Autowired
    private AddressMapper addressMapper;

    // 주소 조회
    @Override
    public List<Address> getAllAddresses() {
        return addressMapper.getAllAddresses();
    }

    // 주소 추가
    @Override
    public void insertAddress(Address address) {
        addressMapper.insertAddress(address);
    }

    // 주소 특정 아이디로 검색하기
    @Override
    public List<Address> getAddressByUserId(Long userId) {
        return addressMapper.getAddressByUserId(userId);
    }
    
    // 대표 주소 설정
    @Override
    public Address getPrimaryAddressByUserId(Long userId) {
        return addressMapper.getPrimaryAddressByUserId(userId);
    }

    // 대표주소 1로 변경하기
    @Override
    public void updatePrimaryAddress(long userId ,long addressId) {
        addressMapper.resetAddressRoles(userId);
        addressMapper.updatePrimaryAddress(addressId);
    }

    // 모든 주소 0 으로 만들기
    @Override
    public void resetAddressRoles(long userId) {
        addressMapper.resetAddressRoles(userId);
    }

    //주소 삭제
    @Override
    public void deleteAddress(long addressId) {
        addressMapper.deleteAddress(addressId);
    }


    // 대표주소 변경
    @Override
    public Address getUserMainAddress(long orderId, long userId) {
        return addressMapper.getUserMainAddress(orderId, userId);
    }

    // 주문 기준으로 사용자가 선택한 주소 가져오기
    @Override
    public Address getUserAddressByOrderId(long orderId) {
        return addressMapper.getUserAddressByOrderId(orderId);
    }
}
