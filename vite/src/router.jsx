import { createBrowserRouter } from "react-router-dom";
import New from './page/new.jsx';
import Male from './page/male.jsx';
import Female from "./page/female.jsx";
import Uniform from "./page/uniform.jsx";
import Collect from './page/user/collect.jsx';
import SearchUser from "./page/hotnews.jsx";
import RegisterForm from "./page/log/register.jsx";
import LoginForm from "./page/log/signin.jsx";
import Dashboard from "./page/admin/admin.jsx";
import App from "./App.jsx";
import ProductDetail from "./components/product.jsx";
import NewProducts from "./components/addProduct.jsx";
import EditProduct from "./page/admin/editproduct.jsx";
import Cart from "./page/user/cart.jsx";
import ForgetPassword from "./page/log/forgotPass.jsx";
import Profile from "./page/user/profile.jsx";
export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/admin", element: <Dashboard /> },
    { path: "/new", element: <New /> },
    { path: "/register", element: <RegisterForm /> },
    { path: "/signin", element: <LoginForm /> },
    { path: "/male", element: <Male /> },
    { path: "/female", element: <Female /> },
    { path: "/add-product", element: <NewProducts /> },
    { path: "/edit-product/:id", element: <EditProduct /> },
    // { path: "/kids", element: <Login /> },
    { path: "/uniform", element: <Uniform /> },
    { path: "/collect", element: <Collect /> },
    { path: "/hotnew", element: <SearchUser /> },
    { path: "/product/:id", element: <ProductDetail /> },
    { path: "/cart", element: <Cart /> },
    { path: "/forgot-password", element: <ForgetPassword /> },
    { path: "/profile", element: <Profile /> },
]);
