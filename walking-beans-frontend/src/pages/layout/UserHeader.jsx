import {useEffect, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserHeader.css";

import chatBubble from "../../assert/svg/userNav/chat_bubble.svg";
import logoImg from "../../assert/svg/userNav/walkingBeans.svg";
import packages from "../../assert/svg/userNav/package.svg";
import person from "../../assert/svg/riderNav/person.svg";
import receipt from "../../assert/svg/userNav/receipt.svg";
import searchIcon from "../../assert/svg/userNav/search.svg";
import shoppingBasket from "../../assert/svg/userNav/shopping_basket.svg";
import toggleIcon from "../../assert/svg/togle.svg";
import userIcon from "../../assert/svg/user.svg";
import apiUserService from "../../service/apiUserService";
import HeaderAlarm from "../../components/admin/HeaderAlarm";

const UserHeader = ({user}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(user);
    const [navOpen, setNavOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [displayStores, setDisplayStores] = useState([]);

    const [unreadCount, setUnreadCount] = useState(0); //알림 개수
    const [showDropdown, setShowDropdown] = useState(false); //토글
    const [notifications, setNotifications] = useState([]); //알림 리스트

    const [userAddress, setUserAddress] = useState(null);  // 주소 상태 관리
    const [userId, setUserId] = useState(null);  // userId 상태
    const [userLat, setUserLat] = useState(null);
    const [userLng, setUserLng] = useState(null);
    const [orderNumber, setOrderNumber] = useState(null);

    // 유저 정보 로드
    useEffect(() => {
        const updateUser = () => {
            const storedUser = localStorage.getItem("user");
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
        };
        updateUser();
        window.addEventListener("userChanged", updateUser);
        return () => {
            window.removeEventListener("userChanged", updateUser);
        };
    }, []);

    // userId가 localStorage에 있다면 설정
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser?.user_id) {
            setUserId(storedUser.user_id);
        }
    }, []);

    //  userId가 설정된 후 대표 주소 가져오기
    useEffect(() => {
        if (userId) {
            apiUserService.primaryAddress(userId, setUserAddress, setUserLat, setUserLng);
        }
    }, [userId]);
    // /user/search/map으로 이동하는 함수 수정
    const handleOpenSearch = () => {
        if (!userLat || !userLng) {
            alert("대표 주소 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        navigate("/user/search/map", { state: { lat: userLat, lng: userLng } });
    };

    // 네비게이션 항목을 역할에 맞게 설정
    const role = currentUser?.user_role;

    let navItems = [];

    if (["user", "rider"].includes(role)) {
        navItems = [
            { icon: person, text: "마이페이지", path: "/mypage" },
            { icon: receipt, text: "주문내역", path: "/order" },
            { icon: chatBubble, text: "채팅", path: "/chat/chattingroom" },
        ];
    } else if (role === "admin") {
        navItems = [
            { icon: person, text: "마이페이지", path: "/mypage" },
        ];
    } else if (role === "owner") {
        navItems = [
            { icon: person, text: "마이페이지", path: "/mypage" },
            { icon: receipt, text: "매출 조회", path: "/owner/revenue" },
            { icon: chatBubble, text: "채팅", path: "/chat/chattingroom" },
        ];
    }

    /**
     * 네비게이션바 토글아이콘  함수
     * toggleIcon from "../../assert/svg/togle.svg
     */
    const handleToggleNav = () => {
        if (!localStorage.getItem("user")) {
            alert("로그인이 필요합니다.");
            navigate("/login");
        } else {
            setNavOpen((prev) => !prev);
        }
    };

    // 로그아웃 함수
    const handleLogout = () => {
        apiUserService.logout();
        setCurrentUser(null);
        setNavOpen(false);
        navigate("/");
    };

    /**
     * userIcon from "../../assert/svg/user.svg
     * 사용자 아이콘 클릭 시 이동
     */
    const handleUserIconClick = () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const rolePaths = {
            user: location.pathname === "/mypage" ? "/" : "/mypage",
            rider: location.pathname === "/rider" ? "/" : "/rider",
            owner: location.pathname === "/owner" ? "/" : "/owner",
            admin: location.pathname === "/adminpage" ? "/" : "/adminpage"
        };
        navigate(rolePaths[parsedUser.user_role] || "/");
    };

    return (
        <div className="user-header-wrapper">
            <header className="custom-header">
                <div className="custom-header-container">
                    <div className="left-icons">
                        <img src={userIcon} className="header-icon" alt="role-icon" onClick={handleUserIconClick}/>
                    </div>
                    <div className="center-logo">
                        <img
                            src={logoImg}
                            className="logo-img"
                            alt="logo"
                            onClick={() => {
                                if (currentUser?.user_role === "user") {
                                    navigate("/");
                                } else if (currentUser?.user_role === "owner") {
                                    navigate("/owner");
                                } else {
                                    navigate("/");
                                }
                            }}
                        />
                    </div>
                    <div className="user-menu-container">
                        {currentUser && (
                            <>
                                <HeaderAlarm userId={currentUser.user_id} bell={false}/>
                                <img src={searchIcon} className="header-icon" alt="search" onClick={handleOpenSearch}/>

                            </>
                        )}
                        <img src={toggleIcon} className="header-icon" alt="toggle" onClick={handleToggleNav}/>
                    </div>
                </div>

                <div className={`side-nav ${navOpen ? "open" : ""}`}>
                    <div className="side-nav-content">
                        {/*
                        <button className="close-btn" onClick={handleToggleNav}>
                            <img src={closeIcon} alt="닫기" />
                        </button>
                        */}
                        <ul className="nav-menu list-unstyled">
                            {navItems.map(({ icon, text, path }) => (
                                <li key={text}>
                                    <a href={path}>
                                        <img src={icon} alt={text}/> {text}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <button className="nav-logout-btn" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default UserHeader;