import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState([]); // Mảng chứa danh sách ảnh
  const [selectedImage, setSelectedImage] = useState(""); // Ảnh đang chọn

  // Lấy dữ liệu sản phẩm theo ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:2000/api/v1/products/${id}`);
        if (response.data && response.data.data) {
  const productData = response.data.data;
  setName(productData.Name || "");
  setPrice(productData.Price || "");
  setDescription(productData.Description || "");
  setImageUrls(productData.ImageURL ? productData.ImageURL.split(",") : []);
} else {
  console.error("Không có dữ liệu sản phẩm!");
}

      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Xử lý cập nhật sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:2000/api/v1/update-product/${id}`, {
        Name: name,
        Price: price,
        Description: description,
        ImageURL: selectedImage, // Cập nhật ảnh đang chọn
      });

      if (response.data.success) {
        alert("Cập nhật sản phẩm thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    }
  };

  if (!product) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa sản phẩm</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 font-semibold">Tên sản phẩm</label>
          <input 
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block mb-2 font-semibold">Giá</label>
          <input 
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2 font-semibold">Mô tả</label>
          <textarea 
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {/* Hiển thị danh sách ảnh */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Chọn ảnh sản phẩm</label>
          <div className="flex gap-2">
            {imageUrls.length > 0 ? (
              imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={`http://localhost:2000/images/${url}`}
                  alt={`Ảnh ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                    selectedImage === url ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(url)}
                />
              ))
            ) : (
              <p>Không có ảnh</p>
            )}
          </div>
        </div>
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Cập nhật sản phẩm  
        </button>
      </form>
    </div>
  );
};

export default EditProduct;


            


