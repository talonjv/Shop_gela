import express from 'express';
import apiController from '../controller/apiController.js';
import apiUser from '../controller/apiUser.js';
import apiProduct from '../controller/apiProduct.js'
import multer from 'multer';
import path from 'path';
import appRoot from 'app-root-path';
import upload from '../middleware/upload.js';
let router = express.Router();

const initAPIroute = (app) => {
    router.get('/user', apiController.getAlluser); // method get = read data
    router.post('/create-user', apiController.createUser); // method post = create data
    router.put('/update-user', apiController.updateUser); // method put = update data
    router.delete('/delete-user/:id', apiController.deleteUser); // method delete = delete data
    router.post('/search-user', apiController.searchUser);
    // api user
    router.post('/register', apiUser.regisTer);
    router.post('/login', apiUser.apiLogin);
    router.post('/logout', apiUser.apiLogOut);
    router.get('/customer/:id', apiUser.viewProfile);
    router.put('/change-customer/:customerId', apiUser.changeProfile);
    router.post('/change-avatar/:customerId/avatar',upload.single("avatar"),apiUser.changeAvatar);
    // api reset password
    router.post('/send-otp', apiUser.apiOTP);
    router.post('/reset-password', apiUser.resetPassword);
    // kiểm tra session
    router.get('/check-ss', apiUser.apiCheck);
    // api product
    router.get('/products',apiProduct.viewProduct);
    router.get('/products/:id',apiProduct.productDetail)
    router.post('/add-new-product',upload.array('images', 10),apiProduct.addNewProduct)
    router.delete('/delete-product/:id',apiProduct.deleteProduct)
    router.put('/update-product/:id',apiProduct.updateProduct)
    //add to cart API
    router.get('/cart/:customerId',apiProduct.getCart)
    // router.get('/cart/:customerId',apiProduct.getCart)
    router.delete('/cart/:customerId/:productId',apiProduct.reMoveItem)
    router.put('/cart/:customerId/:productId',apiProduct.updateCartItem)
    router.post('/productcartdetail/:id',apiProduct.productcartDetail)
    router.post('/add-to-cart',apiProduct.addtoCart)
    // api comment
    router.get('/reviews/product/:id',apiProduct.getreViews)
    router.post('/reviews',apiProduct.createReview)
    return app.use('/api/v1', router);
};

export default initAPIroute;