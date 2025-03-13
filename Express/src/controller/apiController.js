import pool from '../config/connectdb.js';   


let getAlluser = async (req, res) => {
     const [rows , fields] = await pool.execute('SELECT * FROM customers');
    return res.status(200).json({
        Message:'địt mẹ mày',
        data : rows
    })
}
let createUser = async (req, res) => {
    let {fname , lname , email , address } = req.body;
    if(!fname || !lname || !email || !address){
        return res.status(400).json({
            Message : 'Bạn cần nhập đầy đủ thông tin',
        })
    } 
  await pool.execute('INSERT INTO users (firstname,lastname, email, address) VALUES (?, ?, ?,?)', 
    [fname, lname, email, address]);
    return res.status(200).json({
        Message:'địt mẹ mày',
    })
}
let updateUser = async (req, res) => {
    let {fname , lname , email , address , id} = req.body;
     if(!fname || !lname || !email || !address || !id){
        return res.status(400).json({
            Message : 'Bạn cần nhập đầy đủ thông tin',
        })
    } 
  await pool.execute('UPDATE users SET firstname = ?, lastname = ?, email = ?, address = ? WHERE id = ?',
    [fname, lname, email, address , id]);

    return res.status(200).json({
        Message:'địt mẹ mày',
    })
}
let deleteUser = async (req, res) => {
     let userId = req.params.id;
     if(!userId){
        return res.status(400).json({
            Message : 'Bạn cần nhập đầy đủ thông tin',
        })
    } 
  await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    return res.status(200).json({
        Message:'địt mẹ mày',
    })
}

let searchUser = async (req, res) => {
  let { search } = req.body;

  if (!search || search.trim() === "") {
    return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm" });
  }

  try {
    // Sử dụng LOWER() để tìm kiếm không phân biệt chữ hoa/chữ thường
    let query = `
      SELECT * FROM customers
      WHERE CONCAT_WS( ' ',full) LIKE ?`;
    let [users] = await pool.execute(query, [`${search.toLowerCase()}%`]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user nào" });
    }

    return res.json(users);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }

   
};

export default { 
    getAlluser , createUser,updateUser,deleteUser,
    searchUser
 }