import { useState } from "react";
import axios from "axios"; // Import axios
import { Link } from "react-router-dom";

const  RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "Male",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu không khớp!" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.post("http://localhost:2000/api/v1/register", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender,
        profilePicture: "images-1741003690904.jpg",
      });

      setMessage({ type: "success", text: "Đăng ký thành công!" });

      // Reset form sau khi đăng ký thành công
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gender: "",
      });

    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Lỗi máy chủ. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      className="flex flex-col gap-4 max-w-md p-6 rounded-xl bg-gray-900 text-white border border-gray-700"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-sky-400">Đăng Ký</h2>
      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-400" : "text-green-400"}`}>
          {message.text}
        </p>
      )}

      <input 
        type="text" 
        name="fullName" 
        value={formData.fullName} 
        onChange={handleChange} 
        required
        placeholder="Họ và tên"
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-sky-400 outline-none"
      />

      <input 
        type="email" 
        name="email" 
        value={formData.email} 
        onChange={handleChange} 
        required
        placeholder="Email"
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-sky-400 outline-none"
      />

      <input 
        type="text" 
        name="phone" 
        value={formData.phone} 
        onChange={handleChange} 
        required
        placeholder="Số điện thoại"
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-sky-400 outline-none"
      />

      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        required
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-sky-400 outline-none"
      >
        <option value="Male">Nam</option>
        <option value="Female">Nữ</option>
        <option value="Other">Khác</option>
      </select>

      <input 
        type="password" 
        name="password" 
        value={formData.password} 
        onChange={handleChange} 
        required
        placeholder="Mật khẩu"
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-sky-400 outline-none"
      />

      <input 
        type="password" 
        name="confirmPassword" 
        value={formData.confirmPassword} 
        onChange={handleChange} 
        required
        placeholder="Nhập lại mật khẩu"
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-sky-400 outline-none"
      />

      <button 
        type="submit" 
        className="w-full bg-sky-400 hover:bg-sky-500 text-white py-2 rounded-lg text-lg font-semibold transition duration-300 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Đang đăng ký..." : "Đăng ký"}
      </button>
      <Link to="/signin">Đăng nhập</Link>
    </form>
  );
}
export default RegisterForm;


