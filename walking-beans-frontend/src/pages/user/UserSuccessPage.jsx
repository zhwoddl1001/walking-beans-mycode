import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import apiUserOrderService from "../../service/apiUserOrderService"
import loadingIcon from "../../assert/images/user/loadingIcon.png"

const UserSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const paymentKey = queryParams.get("paymentKey");
    const orderId = queryParams.get("orderId");
    const orderTotalPrice = queryParams.get("totalAmount");
    const storeId = queryParams.get("storeId");
    const addressId = queryParams.get("addressId");
    const paymentMethod = queryParams.get("paymentMethod");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.user_id || null;
    const [isConfirmed, setIsConfirmed] = useState(false);
    const orderRequests = queryParams.get("orderRequests");

    useEffect(() => {
        const confirmPayment = async () => {
            if (isConfirmed) return;

            try {
                if (!paymentKey || !orderId || !orderTotalPrice || !userId || !storeId || !addressId) {
                    console.error("필수 결제 정보가 누락되었습니다.", {
                        paymentKey,
                        orderId,
                        orderTotalPrice,
                        userId,
                        storeId,
                        addressId,
                        orderRequests,
                    });
                    alert("결제 정보가 올바르지 않습니다.");
                    navigate("/sandbox/fail", {replace: true});
                    return;
                }

                // 장바구니 데이터 가져오기
                const cartItemsRaw = await apiUserOrderService.getUserCartByUserId(userId);
                console.log("원본 장바구니 데이터:", cartItemsRaw);

                // 장바구니 아이템 정리
                const cartItems = cartItemsRaw.map(cart => {
                    const menuIdArray = cart.menuIds ? cart.menuIds.split(",") : [];
                    return {
                        userId: cart.userId,
                        cartId: cart.cartId,
                        cartQuantity: cart.cartQuantity,
                        userName: cart.userName,
                        userEmail: cart.userEmail,
                        userPhone: cart.userPhone,
                        menuId: menuIdArray.length > 0 ? menuIdArray[0] : null,
                        menuNames: cart.menuNames,
                        menuCategories: cart.menuCategories,
                        menuPrices: cart.menuPrices,
                        optionIds: cart.optionIds,
                        optionNames: cart.optionNames,
                        optionContents: cart.optionContents,
                        optionPrices: cart.optionPrices,
                        totalQuantities: cart.totalQuantities,
                        cartCreateDate: cart.cartCreateDate,
                        menuIdList: menuIdArray,
                        menuNameList: cart.menuNames ? cart.menuNames.split(",") : [],
                        optionNameList: cart.optionNames ? cart.optionNames.split(",") : [],
                        optionContentList: cart.optionContents ? cart.optionContents.split(",") : [],
                        optionPriceList: cart.optionPrices ? cart.optionPrices.split(",").map(Number) : [],
                        totalQuantityList: cart.totalQuantities ? cart.totalQuantities.split(",").map(Number) : [],
                    };
                });

                console.log("가공된 장바구니 데이터:", cartItems);

                // 결제 승인 데이터 전달
                const response = await axios.post("http://localhost:7070/api/payment/confirm", {
                    paymentKey,
                    orderNumber: orderId,
                    orderTotalPrice,
                    userId,
                    storeId,
                    addressId,
                    orderRequests,
                    cartList: cartItems,
                    payments: {
                        paymentMethod: "tossPay",
                        paymentStatus: "완료"
                    }
                });
                console.log("결제 승인 성공:", response.data);
                alert("결제가 성공적으로 완료되었습니다!");
                localStorage.removeItem("orderRequests");


                setIsConfirmed(true);
                navigate(`/user/delivery/status/${orderId}`, {replace: true});
            } catch (error) {
                console.error("결제 승인 실패:", error.response?.data || error.message);
                alert("결제 승인에 실패했습니다.");
                navigate("/sandbox/fail", {replace: true});
            }
        };

        // 필수정보 확인 후 실행
        if (!isConfirmed && paymentKey && orderId && orderTotalPrice) {
            confirmPayment();
        }
    }, [paymentKey, orderId, orderTotalPrice, userId, storeId, addressId, navigate, isConfirmed]);

    return (
        <div className="user-order-background">
            <div className="user-order-loading">
                <img src={loadingIcon}/>
                <p className="user-title-center">주문이 완료 되었습니다.</p>
                <p>주문 번호: {orderId}</p>
            </div>
        </div>
    )
};

export default UserSuccessPage;
