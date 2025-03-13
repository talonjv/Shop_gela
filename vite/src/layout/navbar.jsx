// Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Menu from "../components/dropdown";
import CartReview from "../components/cardLick";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from "../middleware/userSlice";

export default function Navbar() {
  const [showCart, setShowCart] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  const cartRef = useRef(null);
  const menuRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  let timeoutId;

  // =======================
  // 1) Lấy session khi mount
  // =======================
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("http://localhost:2000/api/v1/check-ss", {
          withCredentials: true,
        });
        console.log("check-ss response:", response.data);

        if (response.data?.loggedIn && response.data?.user) {
          // user có dạng { id, name, ... } (KHÔNG phải customerId)
          setUser(response.data.user);

          // Gọi API lấy số lượng giỏ hàng
          fetchCartCount(response.data.user.id); 
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Lỗi kiểm tra session:", error.message);
      }
    };
    checkSession();
  }, []);

  // ===========================
  // 2) Hàm fetchCartCount (API)
  // ===========================
  const fetchCartCount = async (id) => {
    console.log("Đang fetchCartCount với user.id =", id);
    try {
      const res = await axios.get(`http://localhost:2000/api/v1/cart/${id}`);
      console.log("API response:", res.data);

      // Giả định server trả về { cartItems: [...] }
      const items = res.data.cartItems || [];
      const total = items.reduce((acc, item) => acc + (item.Quantity || 0), 0);
      setCartCount(total);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  // ===========================
  // 3) Đóng giỏ hàng, menu, user dropdown khi click ngoài
  // ===========================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCart(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutId);
    setOpenDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setOpenDropdown(null);
    }, 500);
  };

  // ===========================
  // 4) Đăng xuất
  // ===========================
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:2000/api/v1/logout", {}, { withCredentials: true });
      dispatch(logout());
      localStorage.removeItem("userData");
      navigate("/");
      alert("Đã đăng xuất thành công!");

      // Đặt lại cartCount = 0
      setCartCount(0);
      setUser(null);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      alert("Có lỗi xảy ra khi đăng xuất, vui lòng thử lại!");
    }
  };

  // ===========================
  // 5) Callback khi giỏ hàng thay đổi
  // ===========================
  const handleCartUpdated = () => {
    if (user?.id) {
      fetchCartCount(user.id);
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white relative z-50 w-full border-b shadow-md">
      {/* Logo */}
      <Link to="/" className="text-2xl font-semibold ml-4">
        GELA
      </Link>

      {/* --- Menu Desktop --- */}
      <div className="hidden lg:flex space-x-10">
        <div
          className="relative group flex items-center cursor-pointer"
          onMouseEnter={() => handleMouseEnter("danhmuc")}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            to="/hotnew"
            className="flex items-center hover:text-xl hover:border-b-2 border-gray-800"
          >
            Danh mục <FaChevronDown className="ml-1 mt-1" />
          </Link>
          {openDropdown === "danhmuc" && (
            <div
              className="absolute top-16 left-[-600px] mt-2 w-[1470px] bg-white shadow-lg 
              border border-gray-200 rounded-md p-6"
              onMouseEnter={() => handleMouseEnter("danhmuc")}
              onMouseLeave={handleMouseLeave}
            >
              <Menu />
            </div>
          )}
        </div>
        <Link
          to="/register"
          className="hover:text-xl hover:border-b-2 border-gray-800"
        >
          Shop
        </Link>
        <Link
          to="/collect"
          className="hover:text-xl hover:border-b-2 border-gray-800"
        >
          Pages
        </Link>
      </div>

      {/* --- Search, User & Cart trên Desktop --- */}
      <div className="hidden lg:flex items-center space-x-6">
        {/* Icon User */}
        <div ref={userRef} className="relative">
          {user ? (
            <>
              {user.profilePicture ? (
                <img
                  src={`http://localhost:2000/image/${user.profilePicture}`}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer object-cover"
                  onMouseEnter={() => setShowUserDropdown(true)}
                  onError={(e) => (e.target.src = "/fuong.jpg")}
                />
              ) : (
                <IoPersonCircleSharp
                  className="w-10 h-10 cursor-pointer text-blue-600"
                  onMouseEnter={() => setShowUserDropdown(true)}
                />
              )}
            </>
          ) : (
            <IoPersonCircleSharp
              className="w-10 h-10 text-gray-700 cursor-pointer"
              onMouseEnter={() => setShowUserDropdown(true)}
            />
          )}

          {showUserDropdown && (
            <div
              className="absolute top-12 right-0 w-48 bg-white shadow-lg border rounded-md p-2"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              {user ? (
                <>
                  {user.role === 1 && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-200">
                      Quản trị
                    </Link>
                  )}
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="block px-4 py-2 hover:bg-gray-200">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="block px-4 py-2 hover:bg-gray-200">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Icon Search */}
        <IoIosSearch className="w-10 h-10 text-gray-700 cursor-pointer" />

        {/* Icon Cart - chỉ hiển thị khi đã đăng nhập */}
        {user && (
          <div className="relative">
            <MdOutlineShoppingBag
              className="w-10 h-10 text-gray-700 cursor-pointer"
              onClick={() => setShowCart(!showCart)}
            />
            {cartCount > 0 && (
              <span className="px-2 py-1 text-xs rounded-full absolute bottom-[-5px] left-0 bg-red-500 text-white">
                {cartCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* --- Mobile Menu Button --- */}
      <div className="lg:hidden flex items-center space-x-4">
        <IoIosSearch className="w-6 h-6 text-gray-700 cursor-pointer" />

        {/* Icon Cart - chỉ hiển thị khi đã đăng nhập */}
        {user && (
          <div className="relative">
            <MdOutlineShoppingBag
              className="w-6 h-6 text-gray-700 cursor-pointer"
              onClick={() => setShowCart(!showCart)}
            />
            {cartCount > 0 && (
              <span className="px-2 py-1 text-xs rounded-full absolute bottom-[-5px] left-0 bg-red-500 text-white">
                {cartCount}
              </span>
            )}
          </div>
        )}

        <FaBars
          className="w-8 h-8 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* --- Mobile Menu Overlay --- */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-lg w-64 transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex justify-end p-4">
          <FaTimes
            className="w-6 h-6 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
        <div className="flex flex-col space-y-4 p-6">
          <Link
            to="/hotnew"
            className="text-lg font-semibold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Danh mục
          </Link>
          <Link
            to="/shop"
            className="text-lg font-semibold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            to="/hot"
            className="text-lg font-semibold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Pages
          </Link>
        </div>
      </div>

      {/* Giỏ hàng (CartReview) */}
      {showCart && user && (
        <div ref={cartRef} className="absolute top-16 right-4 p-4 w-72 sm:w-64 z-50">
          {/* Truyền callback onCartUpdated để cập nhật cartCount khi thêm/xóa */}
          <CartReview onClose={() => setShowCart(false)} onCartUpdated={handleCartUpdated} />
        </div>
      )}
    </nav>
  );
}















