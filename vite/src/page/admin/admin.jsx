import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
 const navigate = useNavigate();
  useEffect(() => {
    if (activeSection === "products") {
      axios.get("http://localhost:2000/api/v1/products") // Cập nhật đúng API endpoint của bạn
        .then((response) => setProducts(response.data.data))
        .catch((error) => console.error("Lỗi khi tải sản phẩm:", error));
    }
  }, [activeSection]);

 const handleDelete = async (id) => {
  if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

  try {
    await axios.delete(`http://localhost:2000/api/v1/products/${id}`);
    setProducts(products.filter(product => product.ProductID !== id));
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
  }
};

  const handleLogout = () => {
    axios
      .post("http://localhost:2000/api/v1/logout", {}, { withCredentials: true })
      .then(() => {
        navigate("/");
      })
      .catch((error) => console.error("Lỗi đăng xuất:", error));
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white h-screen p-6">
        <h2 className="text-2xl font-semibold mb-6">Danh mục</h2>
        <ul>
          <li className="mb-4 hover:text-gray-300 cursor-pointer" onClick={() => setActiveSection("dashboard")}>Tổng quan</li>
          <li className="mb-4 hover:text-gray-300 cursor-pointer" onClick={() => setActiveSection("orders")}>Đơn hàng</li>
          <li className="mb-4 hover:text-gray-300 cursor-pointer" onClick={() => setActiveSection("customers")}>Khách hàng</li>
          <li className="mb-4 hover:text-gray-300 cursor-pointer" onClick={() => setActiveSection("products")}>Sản phẩm</li>
          <li className="mb-4 hover:text-gray-300 cursor-pointer" onClick={() => setActiveSection("settings")}>Cài đặt</li>
          <li className="mb-4 hover:text-gray-300 cursor-pointer"  onClick={handleLogout}>Đăng xuất</li>
          {/* <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-gray-200"
          >
            Đăng xuất
          </button> */}
        </ul>
      </div>

      {/* Main Content */}
      <div className="p-6 w-3/4">
        {activeSection === "dashboard" && (
          <div className="bg-white shadow-lg rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-4">Thống kê doanh thu</h2>
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">Biểu đồ sẽ hiển thị ở đây</p>
            </div>
          </div>
        )}

        {activeSection === "products" && (
          <div className="bg-white shadow-lg rounded-2xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  className="border rounded-lg p-2" 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Link to="/add-product">thêm sản phẩm</Link> </button>
              </div>
            </div>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Mã</th>
                  <th className="border p-2">Tên</th>
                  <th className="border p-2">Mô tả</th>
                  <th className="border p-2">Giá</th>
                  <th className="border p-2">Giới tính</th>
                  <th className="border p-2">Size</th>
                  <th className="border p-2">Màu</th>
                  <th className="border p-2">Kho</th>
                  <th className="border p-2">Hình</th>
                  <th className="border p-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(product => 
                  product.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  product.Description.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((product) => (
                  <tr key={product.ProductID} className="text-center">
                    <td className="border p-2">{product.ProductID}</td>
                    <td className="border p-2">{product.Name}</td>
                    <td className="border p-2">{product.Description}</td>
                    <td className="border p-2">{product.Price} đ</td>
                    <td className="border p-2">{product.Gender}</td>
                    <td className="border p-2">{product.Size}</td>
                    <td className="border p-2">{product.Color}</td>
                    <td className="border p-2">{product.Stock}</td>
                    <td className="border p-2 grid grid-cols-3 gap-2">
                      {product.ImageURL.split(",").map((img, index) => (
                        <img key={index} src= {`http://localhost:2000/image/${img}`} alt={product.Name} className="w-20 h-12 mx-auto" />
                      ))}
                    </td>
                    <td className="border p-2">
                      <button onClick={() => product.ProductID && navigate(`/edit-product/${product.ProductID}`)} className="bg-blue-500 text-white px-2 py-1 rounded-lg mr-2"><Link to="/edit-product">Sửa</Link></button>
                      <button onClick={() => handleDelete(product.ProductID)} className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600">Xóa</button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

