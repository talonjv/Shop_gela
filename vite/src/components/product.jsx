import Navbar from "../layout/navbar";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from "../middleware/cartSlice";
import { toast,ToastContainer } from "react-toastify";
export default function ProductDetail() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("readcomment");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    Rating: 5,
    Comment: "",
  });
   const user = useSelector((state) => state.user.user);
const customerId = user?.customerId;
console.log('user từ Redux = ', user);
console.log('customerId = ', customerId);
 // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;
  // chỉnh màu
const colorMapping = {
  "trắng": "#FFFFFF",
  "đen": "#000000",
  "vàng": "#FFFF00",
  "đỏ": "#FF0000",
  "xanh": "#008000", // Xanh lá
  "xám": "#808080",
  "xanh dương": "#0000FF",
  "cam": "#FFA500",
  "tím": "#800080",
  "hồng": "#FFC0CB",
};
  // getReview
   useEffect(() => {
    axios
      .get(`http://localhost:2000/api/v1/reviews/product/${id}`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy bình luận:", err);
      });
  }, [id]);

  // createReview 
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!customerId) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }
    const payload = {
      ProductID: id,
      CustomerID: customerId, // Lấy từ Redux
      Rating: newComment.Rating,
      Comment: newComment.Comment,
    };
    axios
      .post("http://localhost:2000/api/v1/reviews", payload)
      .then((res) => {
        res.data 
        // đã bao gồm customername, customeravatar (nếu API trả về)
        setComments([...comments, res.data]);
        setNewComment({ Rating: 5, Comment: "" });
        setActiveSection("readcomment");
      })
      .catch((err) => {
        console.error("Lỗi khi gửi bình luận:", err);
      });
  };
 //hiện thị sản phẩm
 useEffect(() => {
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:2000/api/v1/products/${id}`);
      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error("Sản phẩm không tồn tại hoặc có lỗi từ server");
      }

      const data = response.data.data[0];
      setProduct(data);

      // Xử lý Size
      setSizes(data.Size ? data.Size.split(",").map((size) => size.trim()) : []);

      // Xử lý Color: mapping với mã màu
      setColors(
        data.Color
          ? data.Color.split(",").map((color) => {
              const trimmedColor = color.trim().toLowerCase(); // Loại bỏ khoảng trắng và chuẩn hóa chữ thường
              return {
                name: trimmedColor,
                code: colorMapping[trimmedColor] || trimmedColor, // Dùng mã màu nếu có, nếu không hiển thị tên
              };
            })
          : []
      );
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };
  fetchProduct();
}, [id]);


  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error || !product) return <p>⚠️ {error || "Không tìm thấy sản phẩm"}</p>;

  const imageUrls = product.ImageURL ? product.ImageURL.split(",").map((img) => img.trim()) : [];
  const mainImage = imageUrls.length > 0 ? imageUrls[selectedIndex] : "default.jpg";

  const openModal = (index) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const prevImage = () => {
    setModalIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
  };

  const nextImage = () => {
    setModalIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(newQuantity, product.Stock || 1)));
  };

  // Tính toán slice cho trang hiện tại
  const indexOfLastComment = currentPage * commentsPerPage;   // Vị trí phần tử cuối trang
  const indexOfFirstComment = indexOfLastComment - commentsPerPage; 
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);

// {`http://localhost:2000/image/${img}`} 

//ADD TO CART
const handleAddToCart = async () => {
  if (!product || !customerId) {
    toast.warn("Vui lòng Đăng Nhập trước khi thêm vào giỏ hàng!", {
    position: "top-center",
    autoClose: 3000, // 3 giây tự đóng
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
    return;
  }
  if (!selectedSize || !selectedColor) {
    
    toast.warn("Vui lòng chọn màu sắc và kích thước!", {
    position: "top-center",
    autoClose: 3000, // 3 giây tự đóng
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
    return;
  }

  dispatch(
    addToCart({
      productId: product.ProductID,
      name: product.Name,
      price: product.Price,
      quantity: quantity,
      color: selectedColor?.name,
      size: selectedSize,
      imageURL: product.ImageURL?.split(",")[0],
    })
  );

  try {
    const response = await axios.post("http://localhost:2000/api/v1/add-to-cart", {
      customerId: customerId,
      productId: product.ProductID,
      quantity: quantity,
      color: selectedColor?.name,
      size: selectedSize,
    });

    alert(response.data.message);
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error.response?.data || error.message);
    toast.warn("Sản phẩm đã hết vui lòng chọn sản phẩm khác", {
    position: "top-center",
    autoClose: 3000, // 3 giây tự đóng
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  }
};


  

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột trái: Ảnh sản phẩm */}
        <div>
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="w-1/5 flex flex-col gap-2 overflow-y-auto max-h-[500px]">
              {imageUrls.map((url, index) => (
                <img
                  key={url}
                  src={`http://localhost:2000/image/${url}`}
                  alt={`Ảnh ${index + 1}`}
                  className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                    index === selectedIndex ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => setSelectedIndex(index)}
                />
              ))}
            </div>

            {/* Ảnh chính */}
            <div className="w-4/5">
              <img
                src={`http://localhost:2000/image/${mainImage}`}
                alt="Main Product"
                className=" w-full h-auto rounded-lg object-cover cursor-pointer"
                onClick={() => openModal(selectedIndex)}
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin sản phẩm */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.Name}</h1>
          <p className="text-gray-600">{product.Description}</p>
          <p className="text-red-600 font-semibold text-xl">{product.Price} đ</p>
          <p className={`font-medium ${product.Stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.Stock > 0 ? "• Còn hàng" : "• Hết hàng"}
          </p>

          {/* Chọn Size */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Size</h3>
              <div className="flex gap-2">
                {sizes.map((size,index) => (
                  <button
                    key={`${size}-${index}`}
                    className={`px-4 py-2 border rounded-full ${
                      selectedSize === size ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

{/* Chọn Màu */}
{colors.length > 0 && (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Màu sắc</h3>
    <div className="flex gap-3">
      {colors.map((color,index) => (
        <div
          key={`${color.name}-${index}`}
          className={`w-10 h-10 rounded-full border-2 cursor-pointer flex items-center justify-center text-xs text-white shadow ${
            selectedColor?.name === color.name ? "border-blue-600" : "border-transparent"
          }`}
          style={{ backgroundColor: color.code }}
          onClick={() => setSelectedColor(color)}
        >
          {color.code === "transparent" && color.name} {/* Nếu không tìm thấy màu, hiển thị tên màu */}
        </div>
      ))}
    </div>
  </div>
)}
          {/* Chọn số lượng */}
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Số lượng</h3>
            <div className="flex items-center border rounded px-2">
              <button className="px-3 py-1 text-lg" onClick={() => handleQuantityChange(quantity - 1)}>
                -
              </button>
              <span className="px-4">{quantity  } </span>
              <button className="px-3 py-1 text-lg" onClick={() => handleQuantityChange(quantity + 1)}>
                +
              </button>
            </div>
          </div>

          {/* Nút thêm vào giỏ hàng */}
          <button  onClick={handleAddToCart}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700" >
            Thêm vào giỏ hàng
             <ToastContainer />
          </button>
        </div>
      </div>

      {/* Modal xem ảnh */}
     {isModalOpen && (
  <div className="fixed z-50 inset-0 bg-black bg-opacity-80 flex items-center justify-center" onClick={closeModal}>
    <div className="relative max-w-4xl w-full p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
      {/* Nút đóng */}
      <button className="absolute top-2 right-2  p-2 rounded-full hover:bg-gray-300" onClick={closeModal}>
        ❌
      </button>

      {/* Nút chuyển ảnh */}
      <button className="absolute left-[-60px] top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300" onClick={prevImage}>
        <FaAngleLeft size={50} />
      </button>
      <img src={`http://localhost:2000/image/${imageUrls[modalIndex]}`} alt="Product" className="w-full h-auto rounded-lg object-cover" />
      <button className="absolute right-[-60px] top-1/2 transform -translate-y-1/2  p-2 rounded-full hover:bg-gray-300" onClick={nextImage}>
        <FaAngleRight size={50} />
      </button>

      {/* Thumbnails ở dưới */}
      <div className="flex gap-2 mt-4 justify-center">
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={`http://localhost:2000/image/${url}`}
            alt={`Ảnh ${index + 1}`}
            className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
              index === modalIndex ? "border-blue-500" : "border-transparent"
            }`}
            onClick={() => setModalIndex(index)}
          />
        ))}
      </div>
    </div>
  </div>
)}
    {/* ReViews */}
      {/* ------------------- Khu vực bình luận ------------------- */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Tabs chuyển giữa xem và viết bình luận */}
        <ul className="flex gap-4 justify-center mb-4">
          <li
            className={`text-xl font-bold cursor-pointer rounded-full border-2 p-2 ${
              activeSection === "readcomment" ? "border-blue-600 bg-blue-50" : "border-gray-400"
            }`}
            onClick={() => setActiveSection("readcomment")}
          >
            Đánh giá
          </li>
          <li
            className={`text-xl font-bold cursor-pointer rounded-full border-2 p-2 ${
              activeSection === "createcomment" ? "border-blue-600 bg-blue-50" : "border-gray-400"
            }`}
            onClick={() => setActiveSection("createcomment")}
          >
            Viết bình luận
          </li>
        </ul>

        {/* Xem bình luận */}
        {activeSection === "readcomment" && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Đánh giá cho sản phẩm #{id}</h2>
            {comments.length > 0 ? (
              <>
                {currentComments.map((item, index) => (
                  <div key={`${item.reviewid}-${index}`} className="border-b py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={`http://localhost:2000/image/${item.customeravatar}`}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium">{item.customername}</span>
                    </div>
                    <p className="font-medium">Rating: {item.rating} ⭐</p>
                    <p>{item.comment}</p>
                  </div>
                ))}

                {/* Nút chuyển trang */}
                <div className="flex justify-center gap-4 mt-4">
                  {/* Trang trước */}
                  <button
                    className="px-4 py-2 bg-gray-300 rounded disabled:bg-gray-100"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Trang trước
                  </button>

                  {/* Trang sau */}
                  <button
                    className="px-4 py-2 bg-gray-300 rounded disabled:bg-gray-100"
                    disabled={indexOfLastComment >= comments.length}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Trang sau
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Chưa có bình luận nào.</p>
            )}
          </div>
        )}
        {/* Viết bình luận */}
        {activeSection === "createcomment" && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Viết bình luận</h2>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label className="block font-medium">Đánh giá (1-5):</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newComment.Rating}
                  onChange={(e) => setNewComment({ ...newComment, Rating: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Bình luận:</label>
                <textarea
                  value={newComment.Comment}
                  onChange={(e) => setNewComment({ ...newComment, Comment: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Gửi bình luận
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}











