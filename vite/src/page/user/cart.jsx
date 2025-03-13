import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../../layout/navbar";

const Cart = () => {
  const user = useSelector((state) => state.user.user);
  const customerId = user?.customerId;

  const [cartItems, setCartItems] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  
  // ★ State lưu productId vừa update để highlight
  const [updatedItemId, setUpdatedItemId] = useState(null);
console.log("customerId:", customerId);
  useEffect(() => {
    if (!customerId) return;
    axios
      .get(`http://localhost:2000/api/v1/cart/${customerId}`)
      .then((res) => {
        const items = res.data.cartItems || [];
        setCartItems(items);
        fetchProductDetails(items);
      })
      .catch((error) => {
        console.error("Lỗi khi tải giỏ hàng:", error);
      });
  }, [customerId]);

  const fetchProductDetails = async (items) => {
    try {
      const details = {};
      for (let item of items) {
        const res = await axios.get(`http://localhost:2000/api/v1/products/${item.ProductID}`);
        let product = res.data.data;
        if (Array.isArray(product)) {
          product = product[0];
        }
        if (product) {
          details[item.ProductID] = {
            colors: product.Color ? product.Color.split(",").map((c) => c.trim()) : [],
            sizes: product.Size ? product.Size.split(",").map((s) => s.trim()) : [],
          };
        }
      }
      setProductDetails(details);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
  };

  // ★ Hàm gọi API PUT để update CartItem
  const handleUpdateCartItem = async (productId, updatedData) => {
    try {
      await axios.put(
        `http://localhost:2000/api/v1/cart/${customerId}/${productId}`,
        updatedData
      );
      fetchCart();
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    }
  };
const fetchCart = async () => {
  try {
    const res = await axios.get(`http://localhost:2000/api/v1/cart/${customerId}`);
    setCartItems(res.data.cartItems || []);
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
  }
};
  const handleRemove = async (productId) => {
    try {
      await axios.delete(`http://localhost:2000/api/v1/cart/${customerId}/${productId}`);
      setCartItems((prev) => prev.filter((item) => item.ProductID !== productId));
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.Price || 0) * item.Quantity, 0);
  const tax = 8;
  const shipping = subtotal > 200 ? 0 : 12;
  const total = subtotal + tax + shipping;

  return (
    <>
      <Navbar />
      <div className="p-6 container mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Giỏ hàng của bạn</h2>

        <div className="bg-gray-100 p-4 rounded-lg">
          {cartItems.map((item) => {
            const detail = productDetails[item.ProductID] || {};
            const colors = detail.colors || [];
            const sizes = detail.sizes || [];

            return (
              <div
                key={item.ProductID}
                // ★ Thêm transition-colors để mượt hơn
                className={`flex items-center gap-4 p-4 mb-4 border rounded-lg transition-colors duration-300 ${
                  item.ProductID === updatedItemId ? "bg-green-100" : ""
                }`}
              >
                {/* Nút xóa */}
                <button
                  onClick={() => handleRemove(item.ProductID)}
                  className="text-red-500"
                >
                  &times;
                </button>

                {/* Ảnh */}
                <img
                  src={
                    item.ImageURL
                      ? `http://localhost:2000/image/${item.ImageURL.split(",")[0]}`
                      : "/images/default.jpg"
                  }
                  alt={item.Name}
                  className="w-16 h-16 rounded-lg object-cover"
                />

                {/* Thông tin */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{item.Name}</h3>
                  <p className="text-gray-500">{item.Price} đ</p>

                  {/* Dropdown màu (nếu có) */}
                  {colors.length > 0 && (
                    <select
                      value={item.Color || ""}
                      onChange={(e) =>
                        handleUpdateCartItem(item.ProductID, { color: e.target.value })
                      }
                      className="border p-1 rounded text-sm mt-1"
                    >
                      {colors.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Dropdown size (nếu có) */}
                  {sizes.length > 0 && (
                    <select
                      value={item.Size || ""}
                      onChange={(e) =>
                        handleUpdateCartItem(item.ProductID, { size: e.target.value })
                      }
                      className="border p-1 rounded text-sm mt-1 ml-2"
                    >
                      {sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Nút tăng/giảm số lượng */}
                <div className="flex items-center gap-2">
                  {/* Nút '-' */}
                  <button
                    // ★ Thêm hiệu ứng scale nhỏ khi hover/click
                    className="border p-2 rounded transition-transform duration-150 hover:scale-105 active:scale-95"
                    onClick={() =>
                      handleUpdateCartItem(item.ProductID, {
                        quantity: Math.max(1, item.Quantity - 1),
                      })
                    }
                    disabled={item.Quantity <= 1}
                  >
                    -
                  </button>

                  <span className="w-6 text-center">{item.Quantity}</span>

                  {/* Nút '+' */}
                  <button
                    className="border p-2 rounded transition-transform duration-150 hover:scale-105 active:scale-95"
                    onClick={() =>
                      handleUpdateCartItem(item.ProductID, {
                        quantity: item.Quantity + 1,
                      })
                    }
                  >
                    +
                  </button>
                </div>

                <p className="font-semibold">{(item.Price * item.Quantity).toFixed(2)} đ</p>
              </div>
            );
          })}
        </div>
       


        {/* Tóm tắt đơn hàng */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full md:w-1/3 mx-auto border">
          <h3 className="text-xl font-semibold">Tóm tắt đơn hàng</h3>
          <p className="flex justify-between mt-2">
            <span>Tạm tính:</span>
            <span>{subtotal.toFixed(2)} đ</span>
          </p>
          <p className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span>{shipping.toFixed(2)} đ</span>
          </p>
          <p className="flex justify-between">
            <span>Thuế:</span>
            <span>{tax.toFixed(2)} đ</span>
          </p>
          <p className="flex justify-between font-bold text-lg mt-2">
            <span>Tổng cộng:</span>
            <span>{total.toFixed(2)} đ</span>
          </p>
          <button className="w-full mt-4 bg-black text-white p-2 rounded">
            Thanh toán
          </button>
        </div>
      </div>
    </>
  );
};

export default Cart;









