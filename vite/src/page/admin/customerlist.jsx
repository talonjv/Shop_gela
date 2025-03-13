import { useState, useEffect } from "react";
import axios from "axios";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("http://localhost:2000/api/v1/customers");
        setCustomers(response.data.data); // API trả về danh sách khách hàng
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách khách hàng</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Họ và Tên</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">SĐT</th>
            <th className="border p-2">Giới tính</th>
            <th className="border p-2">Địa chỉ</th>
            <th className="border p-2">Ảnh</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.CustomerID} className="text-center">
              <td className="border p-2">{customer.CustomerID}</td>
              <td className="border p-2">{customer.FullName}</td>
              <td className="border p-2">{customer.Email}</td>
              <td className="border p-2">{customer.Phone}</td>
              <td className="border p-2">{customer.Gender}</td>
              <td className="border p-2">
                {customer.Address}, {customer.District}, {customer.City}
              </td>
              <td className="border p-2">
                {customer.ProfilePicture ? (
                  <img
                    src={`http://localhost:2000/images/${customer.ProfilePicture}`}
                    alt="Profile"
                    className="w-12 h-12 object-cover rounded-full"
                  />
                ) : (
                  "No Image"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
