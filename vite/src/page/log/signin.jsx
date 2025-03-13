import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// Dùng useDispatch để cập nhật Redux
import { useDispatch } from "react-redux";
import { setUser } from "../../middleware/userSlice"; // đường dẫn đúng đến userSlice
import { store } from "../../middleware/store";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:2000/api/v1/login",
        { email, password },
        { withCredentials: true }
      );

      console.log("📌 Response data:", response.data);

      const { user, message } = response.data;

      if (!user || message !== "Đăng nhập thành công") {
        setError(message || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      // Lưu user vào localStorage (nếu muốn)
      localStorage.setItem("user", JSON.stringify(user));
       console.log("🟢 Sẽ dispatch setUser với:", user);
      // user trả về từ server có thể là { CustomerID, FullName, ProfilePicture, role }
      // => ta map sang { customerId, name, avatar, role } để khớp Redux
      dispatch(
        setUser({
          customerId: user.id,
          name: user.fullName,
          avatar: user.ProfilePicture,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          address: user.address,
          district: user.district,
          role:parseInt(user.role, 10)
        })
      );console.log("Sau dispatch, Redux user =", store.getState().user.user);

      // Điều hướng theo role
      const role = typeof user.role === "string" ? parseInt(user.role, 10) : user.role;
      if (role === 1) {
        navigate("/admin");
      } else if (role === 2) {
        navigate("/staff");
      } else {
        // role=0 => khách hàng
        navigate("/");
      }

      alert(
        `✅ Đăng nhập thành công (role=${role}): ${
          role === 0 ? "Khách hàng" : role === 1 ? "Admin" : "Nhân viên"
        }`
      );
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 px-8 py-6 bg-gray-800 rounded-2xl shadow-lg"
      >
        <p className="text-center text-white text-xl font-semibold mb-4">
          Đăng nhập
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="p-3 bg-gray-900 rounded-xl text-gray-300 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="p-3 bg-gray-900 rounded-xl text-gray-300 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className={`px-6 py-2 rounded-lg text-white transition duration-300 ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gray-700 hover:bg-black"
          }`}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <Link
          to="/register"
          className="px-6 py-2 bg-gray-700 rounded-lg text-white text-center transition duration-300 hover:bg-black"
        >
          Đăng ký
        </Link>

        <Link
          to="/forgot-password"
          className="px-6 py-2 bg-gray-700 rounded-lg text-white text-center transition duration-300 hover:bg-red-600"
        >
          Quên mật khẩu?
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;






