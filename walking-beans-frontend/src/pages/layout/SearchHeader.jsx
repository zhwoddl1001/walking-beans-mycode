import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchHeader.css";
import searchIcon from "../../assert/svg/userNav/search.svg";
import logoImg from "../../assert/svg/userNav/walkingBeans.svg";
import menuIcon from "../../assert/svg/togle.svg";
import person from "../../assert/svg/riderNav/person.svg";
import shoppingBasket from "../../assert/svg/userNav/shopping_basket.svg";
import packages from "../../assert/svg/userNav/package.svg";
import receipt from "../../assert/svg/userNav/receipt.svg";
import chatBubble from "../../assert/svg/userNav/chat_bubble.svg";
import apiStoreService from "../../service/apiStoreService";

const SearchHeader = ({setSearchResults}) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [navOpen, setNavOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [sortType, setSortType] = useState("rating");
    const [userLocation, setUserLocation] = useState(null);
    const [displayStores, setDisplayStores] = useState([]);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);
    const getDistance = (lat1, lng1, lat2, lng2) => {
        if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
        const R = 6371; // 지구 반지름 (km)
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // 거리 (km)
    };




    // axios 이용해서 검색 가져오기 설정
    // 콘솔 로그로 가져와지는지 확인
    // 엑시오스 댄 -> 알락 무사히 가져왔습니다.
    // 캐치 -> 데이터를 연결하는데 문제가 발생했습니다.
    const handleSearch = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            apiStoreService.searchStore(e, searchQuery, sortType, userLocation, setDisplayStores)
                .then((response) => {
                    if (response.data.length > 0) {
                        navigate("/user/search/map", { state: { searchResults: response.data } });
                    } else {
                        alert("검색 결과가 없습니다.");
                    }
                })
                .catch((error) => {
                    console.error("❌ 검색 오류:", error);
                });
        }
    };





    const handleToggleNav = () => {
        console.log("햄버거 버튼 클릭됨, 현재 상태:", navOpen);
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            navigate("/login");
        } else {
            setNavOpen((prev) => !prev);
        }
    };



    return (
        <div className="search-header-wrapper">
            <header className="custom-search-header">
                <img src={logoImg} className="logo-img" alt="로고" onClick={() => navigate("/")} />
                <input
                    type="text"
                    className="search-input"
                    placeholder="검색어를 입력하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                />
                <img src={searchIcon} className="header-icon" alt="검색" onClick={() => handleSearch(searchQuery)} />
                <img src={menuIcon} className="header-icon" alt="메뉴" onClick={handleToggleNav} />
            </header>

            <div className={`side-nav ${navOpen ? "open" : ""}`}>
                <div className="side-nav-content">

                    <ul className="nav-menu list-unstyled">
                        {[
                            { icon: person, text: "마이페이지", path: "/mypage" },
                            { icon: receipt, text: "주문내역", path: "/order" },
                            { icon: chatBubble, text: "채팅", path: "/chat/chattingroom" }
                        ].map(({ icon, text, path }) => (
                            <li key={text} onClick={() => navigate(path)}>
                                <a>
                                <img src={icon} alt={text} /> {text}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <button className="nav-logout-btn" onClick={() => {
                        localStorage.removeItem("user");
                        alert("로그아웃 되었습니다.");
                        setCurrentUser(null);
                        setNavOpen(false);
                        navigate("/");
                    }}>
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchHeader;
