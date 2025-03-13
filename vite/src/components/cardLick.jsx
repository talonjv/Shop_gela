import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; 
import { IoClose } from "react-icons/io5";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CartReview({ onClose, onCartUpdated }) {
  // Lấy user từ Redux
  const user = useSelector((state) => state.user.user);
  // Nếu DB dùng cột "customerId" để xác định giỏ hàng, ta dùng user?.customerId:
  const customerId = user?.customerId;

  const [cartItems, setCartItems] = useState([]); 
  const [productDetails, setProductDetails] = useState({}); 
  const navigate = useNavigate();

  // 1) Lấy giỏ hàng khi component mount
  useEffect(() => {
    if (!customerId) return;
    fetchCart();
  }, [customerId]);

  // Hàm gọi API lấy giỏ hàng
  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:2000/api/v1/cart/${customerId}`);
      // API trả về { cartItems: [...] }
      const items = res.data.cartItems || [];
      setCartItems(items);

      // Lấy thêm thông tin color/size
      fetchProductDetails(items);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  // 2) Lấy chi tiết sản phẩm (Color, Size) cho từng item
  const fetchProductDetails = async (items) => {
    try {
      const details = {};
      for (let item of items) {
        const res = await axios.get(`http://localhost:2000/api/v1/products/${item.ProductID}`);
        let product = res.data.data;

        // Nếu trả về dạng mảng [product], lấy phần tử đầu
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

  // 3) Cập nhật số lượng
  const updateQuantity = async (productId, delta) => {
    // Cập nhật state cục bộ
    const updatedItems = cartItems.map((item) =>
      item.ProductID === productId
        ? { ...item, Quantity: Math.max(1, item.Quantity + delta) }
        : item
    );
    setCartItems(updatedItems);

    try {
      const newQty = updatedItems.find((i) => i.ProductID === productId)?.Quantity;
      // Gọi API cập nhật server
      await axios.put(`http://localhost:2000/api/v1/cart/${customerId}/${productId}`, {
        quantity: newQty,
      });
      
      // Gọi callback cho Navbar (nếu có) để cập nhật cartCount
      if (onCartUpdated) onCartUpdated();
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
    }
  };

  // 4) Cập nhật màu/size
  const updateColorOrSize = async (productId, newData) => {
    const updatedItems = cartItems.map((item) =>
      item.ProductID === productId ? { ...item, ...newData } : item
    );
    setCartItems(updatedItems);

    try {
      await axios.put(`http://localhost:2000/api/v1/cart/${customerId}/${productId}`, newData);
      if (onCartUpdated) onCartUpdated();
    } catch (error) {
      console.error("Lỗi khi cập nhật color/size:", error);
    }
  };

  // 5) Xoá sản phẩm
  const removeItem = async (productId) => {
    setCartItems((prev) => prev.filter((item) => item.ProductID !== productId));

    try {
      await axios.delete(`http://localhost:2000/api/v1/cart/${customerId}/${productId}`);
      if (onCartUpdated) onCartUpdated();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  // Tính tổng tiền
  const subtotal = cartItems.reduce((sum, item) => {
    const priceNum = Number(item.Price) || 0; 
    return sum + priceNum * item.Quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg h-[80vh] sm:h-[600px] p-6 rounded-lg shadow-lg relative flex flex-col">
        {/* Nút đóng */}
        <button className="absolute top-4 left-4 text-2xl" onClick={onClose}>
          <IoClose />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">Cart Review</h2>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 flex-grow flex items-center justify-center">
            Your cart is empty
          </p>
        ) : (
          <>
            {/* Danh sách sản phẩm */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {cartItems.map((item) => {
                const detail = productDetails[item.ProductID] || {};
                const colors = detail.colors || [];
                const sizes = detail.sizes || [];

                const priceNum = Number(item.Price) || 0;

                return (
                  <div
                    key={item.ProductID}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <img
                      src={
                        item.ImageURL
                          ? `http://localhost:2000/image/${item.ImageURL.split(",")[0]}`
                          : "/images/default.jpg"
                      }
                      alt={item.Name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 ml-4">
                      <h3 className="text-sm font-medium">{item.Name}</h3>

                      {/* Chọn màu nếu có */}
                      {colors.length > 0 && (
                        <select
                          className="border p-1 rounded text-sm mt-1"
                          value={item.Color || ""}
                          onChange={(e) =>
                            updateColorOrSize(item.ProductID, { color: e.target.value })
                          }
                        >
                          {colors.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Chọn size nếu có */}
                      {sizes.length > 0 && (
                        <select
                          className="border p-1 rounded text-sm mt-1 ml-2"
                          value={item.Size || ""}
                          onChange={(e) =>
                            updateColorOrSize(item.ProductID, { size: e.target.value })
                          }
                        >
                          {sizes.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          className="p-2 border rounded"
                          onClick={() => updateQuantity(item.ProductID, -1)}
                        >
                          <FiMinus />
                        </button>
                        <span className="w-6 text-center">{item.Quantity}</span>
                        <button
                          className="p-2 border rounded"
                          onClick={() => updateQuantity(item.ProductID, 1)}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${priceNum.toFixed(2)}</p>
                      <button
                        className="text-red-500 text-sm mt-2"
                        onClick={() => removeItem(item.ProductID)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tổng tiền */}
            <div className="mt-6 border-t pt-4 flex justify-between text-lg font-medium">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="px-6 py-2 border rounded-lg text-gray-700 w-1/2 mr-2"
                onClick={() => navigate("/cart")}
              >
                Xem giỏ hàng
              </button>
              <button className="px-6 py-2 bg-black text-white rounded-lg w-1/2 ml-2">
                Thanh toán
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}









