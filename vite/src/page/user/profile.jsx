import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Navbar from "../../layout/navbar";
import { setUser } from "../../middleware/userSlice";
import { useNavigate } from "react-router-dom";
export default function Profile() {
  const customerId = useSelector((state) => state.user.user.customerId); // Lấy customerId từ Redux
const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [avatar, setAvatar] = useState("default.jpg");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
 useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    if (storedUser && storedUser.customerId) {
      dispatch(setUser(storedUser));
    }
  }, [dispatch]);
// useEffect(() => {
//     if (!user.customerId) return;

//     axios.get(`http://localhost:2000/api/v1/customer/${user.customerId}`)
//       .then((response) => {
//         console.log("📩 Dữ liệu từ API:", response.data);
//         // Cập nhật Redux Store
//         dispatch(setUser({
//           customerId: user.customerId,
//           name: response.data.FullName || "",
//           email: response.data.Email || "",
//           phone: response.data.Phone || "",
//           gender: response.data.Gender || "male",
//           address: response.data.Address || "",
//           district: response.data.District || "",
//           avatar: response.data.ProfilePicture || "default.jpg",
//         }));

//         // Cập nhật state của component
//         setName(response.data.FullName || "");
//         setEmail(response.data.Email || "");
//         setPhone(response.data.Phone || "");
//         setGender(response.data.Gender || "male");
//         setAddress(response.data.Address || "");
//         setDistrict(response.data.District || "");
//         setAvatar(response.data.ProfilePicture || "default.jpg");
//       })
//       .catch((error) => console.error("❌ Lỗi lấy dữ liệu:", error));
//   }, [user.customerId, dispatch]);
useEffect(() => {
  if (!user.customerId) return; // Chờ Redux có customerId

  axios.get(`http://localhost:2000/api/v1/customer/${user.customerId}`)
    .then((response) => {
      console.log("📩 Dữ liệu từ API:", response.data);

      const userData = {
        customerId: user.customerId,
        name: response.data.FullName || "",
        email: response.data.Email || "",
        phone: response.data.Phone || "",
        gender: response.data.Gender || "male",
        address: response.data.Address || "",
        district: response.data.District || "",
        avatar: response.data.ProfilePicture || "default.jpg",
      };

      dispatch(setUser(userData));
      localStorage.setItem("userData", JSON.stringify(userData));

      // Cập nhật state component
      setName(userData.name);
      setEmail(userData.email);
      setPhone(userData.phone);
      setGender(userData.gender);
      setAddress(userData.address);
      setDistrict(userData.district);
      setAvatar(userData.avatar);
    })
    .catch((error) => console.error("❌ Lỗi lấy dữ liệu:", error));
}, [dispatch, user.customerId]);

  const handleSave = () => {
    if (!customerId) {
      alert("Không tìm thấy ID khách hàng!");
      return;
    }

    const updatedData = {
      FullName: name,
      Email: email,
      Phone: phone,
      Gender: gender,
      Address: address,
      District: district,
    };

    axios.put(`http://localhost:2000/api/v1/change-customer/${customerId}`, updatedData)
      .then((response) => {
        alert(response.data.message);
        console.log("✅ Cập nhật thành công:", response.data);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi cập nhật:", err);
        alert(err.response?.data?.message || "Lỗi khi cập nhật!");
      });
  };

  const handleAvatarChange = (e) => {
    if (!customerId) {
      alert("Không tìm thấy ID khách hàng!");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    axios.post(`http://localhost:2000/api/v1/change-avatar/${customerId}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      const newAvatar = `http://localhost:2000/image/${response.data.fileName}`;
      setAvatar(newAvatar); // Cập nhật ngay avatar mới
      alert("✅ Ảnh đại diện cập nhật thành công!")
    })
    .catch((err) => {
      console.error("❌ Lỗi upload ảnh:", err);
      alert("Lỗi khi cập nhật ảnh đại diện!");
    });
  };
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100 w-[70%] mx-auto">
        <aside className="w-1/4 bg-white p-6 shadow-md">
          <h2 className="text-lg font-bold mb-4">Tài Khoản Của Tôi</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="font-semibold text-orange-500">Hồ Sơ</li>
            <li className="cursor-pointer" onClick={() => navigate("/bank")}>Ngân Hàng</li>
            <li className="cursor-pointer" onClick={() => navigate("/cart")}>Giỏ hàng</li>
            <li className="cursor-pointer" onClick={() => navigate("/address")}>Địa Chỉ</li>
          </ul>
        </aside>

        <main className="flex-1 p-6 bg-white shadow-md w-[70%]">
          <h1 className="text-xl font-bold mb-4">Hồ Sơ Của Tôi</h1>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700">Tên</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Số điện thoại</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Giới tính</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Địa chỉ</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Quận/Huyện</label>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            {/* Avatar */}
            <div className="col-span-2 flex flex-col items-center">
              <div className="relative w-28 h-28 border rounded-full overflow-hidden mb-3">
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <input type="file" onChange={handleAvatarChange} className="hidden" id="fileInput" />
              <label htmlFor="fileInput" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Chọn Ảnh
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg mt-6 hover:bg-orange-600">
            Lưu
          </button>
        </main>
      </div>
    </>
  );
}



