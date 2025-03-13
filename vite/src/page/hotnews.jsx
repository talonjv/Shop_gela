import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../layout/navbar";
// import loaDDing from "../components/loadding";
const SearchUser = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.trim()) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 500); // Debounce 500ms

      return () => clearTimeout(delayDebounceFn);
    } else {
      setUsers([]);
      setError("");
    }
  }, [search]);

  const handleSearch = async () => {
    if (!search.trim()) {
      setError("Vui lòng nhập từ khóa tìm kiếm");
      setUsers([]);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const res = await axios.post("http://localhost:2000/api/v1/search-user", { search });

      setUsers(res.data); // Cập nhật danh sách user
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tìm user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
        <h2>Tìm kiếm User</h2>
        <input
          type="text"
          placeholder="Nhập từ khóa tìm kiếm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
        />

        {/* {loading && <p style={{ color: "blue", marginTop: "10px" }}> <loaDDing/> </p>} */}
        {loading && <p style={{ color: "blue", marginTop: "10px" }}>Đang tìm kiếm.... </p>}
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        {users.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Kết quả tìm kiếm:</h3>
            <ul>
              {users.map((user) => (
                <li key={user.CustomerID}>
                  <strong>{user.FullName}{user.Email}</strong> - {user.Phone}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchUser;



