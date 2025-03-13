import pool from '../config/connectdb.js';


const viewProduct = async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM products  ");
        return res.status(200).json({
            message: "Lấy danh sách sản phẩm thành công",
            data: rows, // Đưa danh sách sản phẩm vào key "data"
        });
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message,
        });
    }
};
const addNewProduct = async (req, res) => {
    try {
        const { Name, Description, Price, Gender, Size, Color, Stock, IsVisible, CategoryID } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "At least one image is required" });
        }

        if (!Name || !Price || !Stock || !CategoryID) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const priceValue = parseFloat(Price);
        const stockValue = parseInt(Stock, 10);
        const isVisibleValue = IsVisible ? 1 : 0;

        if (isNaN(priceValue) || isNaN(stockValue)) {
            return res.status(400).json({ error: "Price and Stock must be numbers" });
        }

        const imageUrls = req.files.map(file => file.filename).join(',');

        if (!pool) {
            return res.status(500).json({ error: "Database connection failed" });
        }

        const categoryCheckQuery = `SELECT * FROM categories WHERE CategoryID = ?`;
        const [categoryRows] = await pool.query(categoryCheckQuery, [CategoryID]);

        if (categoryRows.length === 0) {
            return res.status(400).json({ error: "Invalid CategoryID: Category does not exist" });
        }

        const sql = `INSERT INTO products (Name, Description, Price, Gender, Size, Color, Stock, ImageURL, IsVisible) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [Name, Description, priceValue, Gender, Size, Color, stockValue, imageUrls, isVisibleValue];

        const [result] = await pool.execute(sql, values);

        res.status(201).json({ message: 'Product added successfully', productId: result.insertId });

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
const productDetail = async (req, res) => {
  const { id } = req.params;
  console.log(`🟢 Nhận request với ProductID: ${id}`);

  if (!id) {
    return res.status(400).json({ message: "Thiếu ProductID!" });
  }

  const sql = "SELECT * FROM products WHERE ProductID = ?";

  try {
    console.log("🔄 Đang chạy query...");
    
    // Gọi query trực tiếp từ pool (vì pool đã có .promise())
    const rows = await pool.query(sql, [id]);

    if (rows.length === 0) {
      console.warn(`⚠️ Không tìm thấy sản phẩm với ID ${id}`);
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    console.log("✅ Lấy sản phẩm thành công:", rows[0]);
    res.status(200).json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const productcartDetail = async (req, res) => {
  const { id } = req.params;
  console.log(`🟢 Nhận request với ProductID: ${id}`);

  if (!id) {
    return res.status(400).json({ message: "Thiếu ProductID!" });
  }

  const sql = "SELECT * FROM products WHERE ProductID = ?";

  try {
    console.log("🔄 Đang chạy query...");

    // MySQL2 trả về [rows, fields], cần destructure [rows]
    const [rows] = await pool.query(sql, [id]);

    if (!rows || rows.length === 0) {
      console.warn(`⚠️ Không tìm thấy sản phẩm với ID ${id}`);
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    // rows[0] là bản ghi sản phẩm
    let product = rows[0];

    // Nếu cột Color là chuỗi "Đỏ, Xanh, Đen" thì tách ra thành mảng
    if (product.Color) {
      product.colors = product.Color.split(",").map((c) => c.trim());
    } else {
      product.colors = []; // hoặc null, tùy ý
    }

    // Nếu cột Size là chuỗi "S, M, L" thì tách ra thành mảng
    if (product.Size) {
      product.sizes = product.Size.split(",").map((s) => s.trim());
    } else {
      product.sizes = [];
    }

    console.log("✅ Lấy sản phẩm thành công:", product);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
    const { productid } = req.params; // Lấy productid từ URL

    if (!productid) {
        return res.status(400).json({ message: "Lỗi: Thiếu productId" });
    }

    try {
        const [rows] = await pool.execute("SELECT * FROM products WHERE ProductID = ?", [productid]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        await pool.execute("DELETE FROM products WHERE ProductID = ?", [productid]);
        return res.status(200).json({ message: "Sản phẩm đã được xóa thành công" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};
const updateProduct = async (req,res) =>{
    const { id } = req.params;
  const { Name, Description, Price, Gender, Size, Color, Stock, CategoryID, ImageURL, IsVisible } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE product 
       SET Name = ?, Description = ?, Price = ?, Gender = ?, Size = ?, Color = ?, Stock = ?, CategoryID = ?, ImageURL = ?, IsVisible = ? 
       WHERE ProductID = ?`,
      [Name, Description, Price, Gender, Size, Color, Stock, CategoryID, ImageURL, IsVisible, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    res.json({ message: "Cập nhật sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}
const getreViews = async (req , res) =>{
   try {
    const { id } = req.params;
    const query = `
      SELECT
        r.ReviewID      AS reviewid,
        r.ProductID     AS productid,
        r.CustomerID    AS customerid,
        r.Rating        AS rating,
        r.Comment       AS comment,
        r.CreatedAt     AS createdat,
        c.FullName      AS customername,
        c.ProfilePicture AS customeravatar
      FROM reviews r
      JOIN customers c ON r.CustomerID = c.CustomerID
      WHERE r.ProductID = ?
      ORDER BY r.ReviewID DESC
    `;
    const [rows] = await pool.query(query, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const createReview = async (req , res)  =>{
  try {
    const { ProductID, CustomerID, Rating, Comment } = req.body;
    
    // Bước 1: Thêm review mới
    const insertQuery = `
      INSERT INTO reviews (ProductID, CustomerID, Rating, Comment)
      VALUES (?, ?, ?, ?)
    `;
    const [insertResult] = await pool.query(insertQuery, [ProductID, CustomerID, Rating, Comment]);
    const newReviewId = insertResult.insertId; // ID của review vừa chèn

    // Bước 2: Lấy review vừa chèn, JOIN customers để có FullName + ProfilePicture
    const selectQuery = `
      SELECT r.ReviewID,
             r.ProductID,
             r.CustomerID,
             r.Rating,
             r.Comment,
             r.CreatedAt,
             c.FullName AS customername,
             c.ProfilePicture AS customeravatar
      FROM reviews r
      JOIN customers c ON r.CustomerID = c.CustomerID
      WHERE r.ReviewID = ?
    `;
    const [reviewRows] = await pool.query(selectQuery, [newReviewId]);

    if (reviewRows.length > 0) {
      // Trả về object review vừa thêm, kèm thông tin user
      res.json(reviewRows[0]);
    } else {
      res.status(404).json({ error: "Review not found after insert" });
    }
  } catch (err) {
    console.error('Error in POST /reviews:', err);
    res.status(500).json({ error: err.message });
  }
}
const addtoCart = async (req, res) => {
    const { customerId, productId, quantity, color, size } = req.body;

    if (!customerId || !productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Thông tin đầu vào không hợp lệ' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Kiểm tra sản phẩm tồn tại và kiểm tra tồn kho
        let [product] = await connection.query('SELECT Stock FROM products WHERE ProductID = ?', [productId]);
        if (product.length === 0) {
            throw new Error('Sản phẩm không tồn tại');
        }

        if (product[0].Stock < quantity) {
            throw new Error('Không đủ hàng trong kho');
        }

        // Kiểm tra giỏ hàng của khách hàng
        let [cart] = await connection.query('SELECT CartID FROM cart WHERE CustomerID = ?', [customerId]);
        let cartId;

        if (cart.length === 0) {
            let [result] = await connection.query(
                'INSERT INTO cart (CustomerID, CreatedAt, UpdatedAt) VALUES (?, NOW(), NOW())',
                [customerId]
            );
            cartId = result.insertId;
        } else {
            cartId = cart[0].CartID;
        }

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        let [cartItem] = await connection.query(
            'SELECT CartItemID, Quantity FROM cartitems WHERE CartID = ? AND ProductID = ? AND Color = ? AND Size = ?',
            [cartId, productId, color, size]
        );

        if (cartItem.length > 0) {
            // Nếu đã có, cập nhật số lượng
            await connection.query(
                'UPDATE cartitems SET Quantity = Quantity + ? WHERE CartItemID = ?',
                [quantity, cartItem[0].CartItemID]
            );
        } else {
            // Nếu chưa có, thêm mới vào CartItem
            await connection.query(
                'INSERT INTO cartitems (CartID, ProductID, Quantity, Color, Size) VALUES (?, ?, ?, ?, ?)',
                [cartId, productId, quantity, color, size]
            );
        }

        await connection.commit();
        res.json({ message: 'Thêm sản phẩm vào giỏ hàng thành công' });
    } catch (error) {
        await connection.rollback();
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    } finally {
        connection.release();
    }
};
const getCart = async (req, res) => {
  const { customerId } = req.params;

    if (!customerId) {
        return res.status(400).json({ message: 'Thiếu customerId' });
    }

    const connection = await pool.getConnection();
    try {
        const [cart] = await connection.query(
            'SELECT CartID FROM cart WHERE CustomerID = ?',
            [customerId]
        );

        if (cart.length === 0) {
            return res.json({ message: 'Giỏ hàng trống', cartItems: [] });
        }

        const cartId = cart[0].CartID;

        const [cartItems] = await connection.query(
            `SELECT ci.CartItemID, ci.ProductID, ci.Quantity, ci.Color, ci.Size,
                    p.Name, p.Price, p.ImageURL
             FROM cartitems ci
             JOIN products p ON ci.ProductID = p.ProductID
             WHERE ci.CartID = ?`,
            [cartId]
        );

        res.json({ cartItems });
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    } finally {
        connection.release();
    }
}
const reMoveItem = async (req, res) => {
    const { customerId, productId } = req.params;

    if (!customerId || !productId) {
        return res.status(400).json({ message: 'Thiếu customerId hoặc productId' });
    }

    const connection = await pool.getConnection();
    try {
        // Lấy CartID từ bảng Cart
        const [cart] = await connection.query(
            'SELECT CartID FROM cart WHERE CustomerID = ?',
            [customerId]
        );

        if (cart.length === 0) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        const cartId = cart[0].CartID;

        // Xóa sản phẩm khỏi giỏ hàng
        const [result] = await connection.query(
            'DELETE FROM cartitems WHERE CartID = ? AND ProductID = ?',
            [cartId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' });
        }

        res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    } finally {
        connection.release();
    }
};
const updateCartItem = async (req, res) => {
  const { customerId, productId } = req.params;
  let { color, size, quantity } = req.body;  // có thể chỉ 1 trong 3 trường

  if (!customerId || !productId) {
    return res.status(400).json({ message: "Thiếu customerId hoặc productId" });
  }

  // Không để số lượng <= 0
  if (quantity !== undefined && quantity <= 0) {
    quantity = 1;
  }

  const connection = await pool.getConnection();
  try {
    // 1) Lấy CartID
    const [cart] = await connection.query(
      "SELECT CartID FROM cart WHERE CustomerID = ?",
      [customerId]
    );
    if (cart.length === 0) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }
    const cartId = cart[0].CartID;

    // 2) Kiểm tra CartItem
    const [cartItem] = await connection.query(
      "SELECT * FROM cartitems WHERE CartID = ? AND ProductID = ?",
      [cartId, productId]
    );
    if (cartItem.length === 0) {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });
    }

    // 3) Tạo câu lệnh UPDATE linh hoạt (partial update)
    const fields = [];
    const values = [];

    // Nếu frontend gửi "color", thêm vào câu lệnh
    if (color !== undefined) {
      fields.push("Color = ?");
      values.push(color);
    }
    // Nếu gửi "size"
    if (size !== undefined) {
      fields.push("Size = ?");
      values.push(size);
    }
    // Nếu gửi "quantity"
    if (quantity !== undefined) {
      fields.push("Quantity = ?");
      values.push(quantity);
    }

    // Nếu không có trường nào cần update
    if (fields.length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    // 4) Thực hiện UPDATE
    const sql = `UPDATE cartitems SET ${fields.join(", ")} WHERE CartID = ? AND ProductID = ?`;
    values.push(cartId, productId);

    await connection.query(sql, values);

    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  } finally {
    connection.release();
  }
};


















export default { 
  viewProduct ,addNewProduct,productDetail,
  deleteProduct,updateProduct,getreViews ,
  createReview,addtoCart,getCart,reMoveItem,
  updateCartItem,productcartDetail 

 };
