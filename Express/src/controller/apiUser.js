import pool from '../config/connectdb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import session from "express-session";
import transporter from '../middleware/mailer.js';
import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
let apiLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Hãy nhập email và password" });
  }

  try {
    // 🔹 Tìm user theo email
    const [results] = await pool.query("SELECT * FROM customers WHERE Email = ?", [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const customer = results[0];
    const storedPassword = customer.PasswordHash;
    console.log(customer)
    let isMatch = false;

    // 🔹 Kiểm tra nếu mật khẩu đã mã hóa (bcrypt)
    if (storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2a$")) {
      isMatch = await bcrypt.compare(password, storedPassword);
    } else {
      // 🔹 Nếu mật khẩu chưa mã hóa, so sánh trực tiếp
      isMatch = password === storedPassword;
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu sai" });
    }

    // ✅ Đảm bảo Role luôn là số nguyên
    let role = customer.role !== undefined ? parseInt(customer.role, 10) : 0;

    console.log("📌 Role sau khi lấy từ DB:", role, "Kiểu dữ liệu:", typeof role);

    // 🛡️ Tạo token đăng nhập
    const token = jwt.sign(
      { id: customer.CustomerID, email: customer.Email, role: role },
      "SECRET_KEY",
      { expiresIn: "1h" }
    );

    // ✅ Lưu session
    req.session.user = {
      id: customer.CustomerID,
      fullName: customer.FullName,
      email: customer.Email,
      phone: customer.Phone,
      role: role, // Role được xác định rõ ràng
      profilePicture: customer.ProfilePicture || null,
    };

    return res.json({
      message: "Đăng nhập thành công",
      user: req.session.user,
      token: token, // Gửi token nếu cần dùng cho xác thực
    });

  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};
let apiLogOut = async (req,res) =>{
  req.session.destroy();
  res.json({ message: "Đăng xuất thành công" });
}
let apiCheck = async (req , res) =>{
if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  } else {
    return res.json({ loggedIn: false, message: "Chưa đăng nhập" });
  }
}
const viewProfile = async (req, res) => {
  try {
    const customerId = req.params.id;

    // Kiểm tra customerId có hợp lệ không (chỉ cho phép số)
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ error: "ID khách hàng không hợp lệ" });
    }

    const sql = "SELECT * FROM customers WHERE CustomerID = ?";
    
    // Sử dụng pool với promise
    const [rows] = await pool.query(sql, [customerId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    let customer = rows[0];

    // Xử lý ProfilePicture thành URL đầy đủ
    customer.ProfilePicture = customer.ProfilePicture
      ? `http://localhost:2000/image/${customer.ProfilePicture}`
      : `http://localhost:2000/image/default.jpg`; // Ảnh mặc định nếu null

    res.json(customer); // Trả về thông tin khách hàng
  } catch (error) {
    console.error("Lỗi truy vấn database:", error);
    res.status(500).json({ error: "Lỗi truy vấn database" });
  }
};
const changeProfile = async (req, res) => {
  try {
    // Kiểm tra request có nhận params & body không
    console.log("🟢 API nhận request:", req.params, req.body);

    // Lấy customerId từ params
    const customerId = req.params.customerId; 
    if (!customerId) {
      return res.status(400).json({ message: "Thiếu customerId!" });
    }

    // Lấy dữ liệu từ body
    const { FullName, Email, Phone, Gender, Address, District } = req.body;
    if (!FullName || !Email || !Phone) {
      return res.status(400).json({ message: "Thiếu dữ liệu cập nhật!" });
    }

    // Kiểm tra khách hàng có tồn tại không
    const [customer] = await pool.query("SELECT * FROM customers WHERE customerId = ?", [customerId]);
    console.log("🔍 Kiểm tra khách hàng:", customer);

    if (!customer || customer.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng!" });
    }

    // Cập nhật thông tin
    const [result] = await pool.query(
      "UPDATE customers SET FullName = ?, Email = ?, Phone = ?, Gender = ?, Address = ?, District = ? WHERE customerId = ?",
      [FullName, Email, Phone, Gender, Address, District, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Không thể cập nhật khách hàng!" });
    }

    console.log("✅ Cập nhật thành công!");
    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error) {
    console.error("🚨 Lỗi cập nhật khách hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};
const changeAvatar = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log("📩 File nhận được:", req.file); // Log thông tin file
    console.log("📌 Customer ID:", customerId); // Log ID khách hàng

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn tệp ảnh!" });
    }

    // Kiểm tra khách hàng có tồn tại không
    const [customer] = await pool.query("SELECT * FROM customers WHERE customerId = ?", [customerId]);
    if (customer.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng!" });
    }

    // Cập nhật đường dẫn ảnh trong database
    
     const filePath = `${req.file.filename}`;
    await pool.query("UPDATE customers SET ProfilePicture = ? WHERE customerId = ?", [filePath, customerId]);

    res.json({ message: "Cập nhật ảnh đại diện thành công!", fileName: req.file.filename });
  } catch (error) {
    console.error("❌ Lỗi upload ảnh:", error);
    res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
  }
};
// const regisTer = async (req, res) => {
//   try {
//     const { fullName, email, phone, password, gender } = req.body;

//     if (!fullName || !email || !phone || !password || !gender) {
//       return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
//     }

//     let [existingUsers] = await pool.execute("SELECT * FROM customers WHERE Email = ?", [email]);

//     if (existingUsers.length > 0) {
//       return res.status(400).json({ message: "Email đã tồn tại" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Đường dẫn ảnh mặc định trong thư mục public/images
//     const defaultAvatar = `db1.png`;

//     const sql = `INSERT INTO customers (FullName, Email, Phone, PasswordHash, Gender, ProfilePicture) 
//                  VALUES (?, ?, ?, ?, ?, ?)`;

//     let [result] = await pool.execute(sql, [fullName, email, phone, hashedPassword, gender, defaultAvatar]);

//     res.status(201).json({ message: "Đăng ký thành công", userId: result.insertId });

//   } catch (error) {
//     console.error("Lỗi đăng ký:", error);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };
const regisTer = async (req, res) => {
  try {
    const { fullName, email, phone, password, gender } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!fullName || !email || !phone || !password || !gender) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra email đã tồn tại chưa
    let [existingUsers] = await pool.execute(
      "SELECT * FROM customers WHERE Email = ?", 
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ảnh mặc định
    const defaultAvatar = "ph.jpg";

    // INSERT user mới, gán role = 0
    const sql = `
      INSERT INTO customers (
        FullName, 
        Email, 
        Phone, 
        PasswordHash, 
        Gender, 
        ProfilePicture, 
        role
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    let [result] = await pool.execute(sql, [
      fullName, 
      email, 
      phone, 
      hashedPassword, 
      gender, 
      defaultAvatar, 
      0
    ]);

    return res.status(201).json({ 
      message: "Đăng ký thành công", 
      userId: result.insertId 
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
const apiOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra email có tồn tại không
    const [rows] = await pool.query("SELECT * FROM customers WHERE Email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Tạo OTP 6 chữ số
    const otp = crypto.randomInt(100000, 999999).toString();

    // Tạo JWT chứa OTP và email, hết hạn sau 5 phút
    const otpToken = jwt.sign({ email, otp }, SECRET_KEY, { expiresIn: "10m" });


    // Gửi email chứa OTP Token
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác thực OTP - Đặt lại mật khẩu",
      text: `Mã OTP của bạn là: ${otp}. OTP này sẽ hết hạn sau 5 phút. 
      Để xác thực, hãy gửi OTP kèm theo token này: ${otpToken}`,
    });

    res.json({ message: "OTP đã được gửi đến email của bạn", otpToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
const resetPassword = async (req, res) => {
  const { email, otp, otpToken } = req.body;

  try {
    // Giải mã JWT để lấy OTP
    let decoded;
    try {
      decoded = jwt.verify(otpToken, SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ message: "OTP đã hết hạn hoặc không hợp lệ" });
    }

    // Kiểm tra email có khớp với email trong token không
    if (decoded.email !== email) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    // Kiểm tra OTP có khớp không
    if (decoded.otp !== otp) {
      return res.status(400).json({ message: "OTP không hợp lệ" });
    }

    // Tạo mật khẩu mới ngẫu nhiên
    const newPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới trong database
    await pool.query("UPDATE customers SET PasswordHash = ? WHERE Email = ?", [hashedPassword, email]);

    // Gửi mật khẩu mới qua email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mật khẩu mới của bạn",
      text: `Mật khẩu mới của bạn là: ${newPassword}. Vui lòng đăng nhập và đổi mật khẩu ngay!`,
    });

    res.json({ message: "Mật khẩu mới đã được gửi đến email của bạn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export default { 
  apiLogin,regisTer,apiLogOut,
  apiCheck,apiOTP,resetPassword,
  viewProfile,changeProfile,changeAvatar
 };

