import { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineEye } from "react-icons/ai";
import Navbar from "../../layout/navbar";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 12;

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState(1000000);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:2000/api/v1/products/")
      .then(response => {
        console.log("📌 API Response:", response.data);
        if (response.data && Array.isArray(response.data.data)) {
          const maleProducts = response.data.data.filter(product => product.Gender?.toLowerCase() === "male");
          setProducts(maleProducts);
        } else {
          console.error("❌ API trả về dữ liệu không hợp lệ:", response.data);
        }
      })
      .catch(error => console.error(" Lỗi khi lấy dữ liệu sản phẩm:", error));
  }, []);

  const filteredProducts = products.filter((product) =>
    product.Price <= priceRange &&
    (selectedSize ? product.Size?.includes(selectedSize) : true) &&
    (selectedColor ? product.Color?.toLowerCase() === selectedColor.toLowerCase() : true)
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row p-4">
        <div className="w-full md:w-1/4 p-4 border rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-bold">Bộ lọc</h2>
          <div className="mt-4">
            <label className="font-semibold">Giá</label>
            <input
              type="range"
              min="0"
              max="1000000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full mt-2"
            />
            <p className="text-gray-600">Giá tối đa: {priceRange.toLocaleString()} đ</p>
          </div>
          <div className="mt-4">
            <label className="font-semibold">Kích thước</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Tất cả</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="font-semibold">Màu sắc</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Tất cả</option>
              <option value="Đỏ">Đỏ</option>
              <option value="Xanh">Xanh</option>
              <option value="Vàng">Vàng</option>
              <option value="Đen">Đen</option>
              <option value="Trắng">Trắng</option>
            </select>
          </div>
        </div>
        <div className="w-full md:w-3/4 p-4">
          <h1 className="text-2xl font-bold">Sản phẩm Nam</h1>
          <p className="text-gray-500">{filteredProducts.length} sản phẩm</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product) => {
                if (!product.ProductID) {
                  console.warn("⚠️ Sản phẩm không có ProductID:", product);
                  return null;
                }
                const imageUrls = product.ImageURL ? product.ImageURL.split(",") : [];
                const mainImage = imageUrls.length > 0 ? imageUrls[0] : "default.jpg";

                return (
                  <div key={product.ProductID} className="border p-2 rounded-lg relative group">
                    <div
                      className="w-full h-48 bg-cover bg-center rounded cursor-pointer"
                      style={{ backgroundImage: `url(http://localhost:2000/image/${mainImage})` }}
                      onClick={() => product.ProductID && navigate(`/product/${product.ProductID}`)}
                    />
                    <button
                      onClick={() => setPreviewImage(`http://localhost:2000/image/${mainImage}`)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full text-white hidden group-hover:block"
                    >
                      <AiOutlineEye size={24} />
                    </button>
                    <h3 className="text-sm mt-2">{product.Name}</h3>
                    <div className="text-lg font-bold">{product?.Price ? product.Price.toLocaleString() + " đ" : "Giá không có"}</div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">Không có sản phẩm nào phù hợp.</p>
            )}
          </div>
          <div className="flex justify-center mt-4">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 px-3 py-2 rounded-md ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative">
            <button onClick={() => setPreviewImage("")} className="absolute top-2 right-2 bg-white p-2 rounded-full">
              ❌
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-screen rounded-lg" />
          </div>
        </div>
      )}
    </>
  );
}

















