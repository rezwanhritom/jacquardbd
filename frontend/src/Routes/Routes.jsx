import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import Root from "../Pages/Root";
import Loading from "../components/Loading";
import AuthWrapper from "../Pages/Auth/AuthWrapper";

// Lazy load all pages
const Home = lazy(() => import("../Pages/Home"));
const About = lazy(() => import("../Pages/About"));
const Category = lazy(() => import("../Pages/Category"));
const Collection = lazy(() => import("../Pages/Collection"));
const ProductDetail = lazy(() => import("../Pages/ProductDetail"));
const Search = lazy(() => import("../Pages/Search"));
const Cart = lazy(() => import("../Pages/Cart"));
const Checkout = lazy(() => import("../Pages/Checkout"));
const OrderSuccess = lazy(() => import("../Pages/OrderSuccess"));
const Account = lazy(() => import("../Pages/Account/Account"));
const AccountDashboard = lazy(() => import("../Pages/Account/Dashboard"));
const AccountProfile = lazy(() => import("../Pages/Account/Profile"));
const AccountOrders = lazy(() => import("../Pages/Account/Orders"));
const AccountOrderDetail = lazy(() => import("../Pages/Account/OrderDetail"));
const AccountAddresses = lazy(() => import("../Pages/Account/Addresses"));
const AccountWishlist = lazy(() => import("../Pages/Account/Wishlist"));
const AccountMembership = lazy(() => import("../Pages/Account/Membership"));
const AccountNewsletter = lazy(() => import("../Pages/Account/Newsletter"));
const AccountSettings = lazy(() => import("../Pages/Account/Settings"));
const Admin = lazy(() => import("../Pages/Admin/Admin"));
const AdminDashboard = lazy(() => import("../Pages/Admin/Dashboard"));
const AdminProducts = lazy(() => import("../Pages/Admin/Products"));
const AdminOrders = lazy(() => import("../Pages/Admin/Orders"));
const AdminUsers = lazy(() => import("../Pages/Admin/Users"));
const AdminCampaigns = lazy(() => import("../Pages/Admin/Campaigns"));
const AdminSettings = lazy(() => import("../Pages/Admin/Settings"));

// Auth pages
const Login = lazy(() => import("../Pages/Auth/Login"));
const Register = lazy(() => import("../Pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../Pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../Pages/Auth/ResetPassword"));

// Wrapper component for Suspense
const LazyWrapper = ({ children }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  // Auth routes (with DarkModeProvider)
  {
    element: <AuthWrapper />,
    children: [
      {
        path: "/login",
        element: (
          <LazyWrapper>
            <Login />
          </LazyWrapper>
        ),
      },
      {
        path: "/register",
        element: (
          <LazyWrapper>
            <Register />
          </LazyWrapper>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <LazyWrapper>
            <ForgotPassword />
          </LazyWrapper>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <LazyWrapper>
            <ResetPassword />
          </LazyWrapper>
        ),
      },
    ],
  },
  // Main app routes
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Home />
          </LazyWrapper>
        ),
      },
      {
        path: "about",
        element: (
          <LazyWrapper>
            <About />
          </LazyWrapper>
        ),
      },
      {
        path: "category/:categoryName",
        element: (
          <LazyWrapper>
            <Category />
          </LazyWrapper>
        ),
      },
      {
        path: "collection/:collectionId",
        element: (
          <LazyWrapper>
            <Collection />
          </LazyWrapper>
        ),
      },
      {
        path: "product/:productId",
        element: (
          <LazyWrapper>
            <ProductDetail />
          </LazyWrapper>
        ),
      },
      {
        path: "search",
        element: (
          <LazyWrapper>
            <Search />
          </LazyWrapper>
        ),
      },
      {
        path: "cart",
        element: (
          <LazyWrapper>
            <Cart />
          </LazyWrapper>
        ),
      },
      {
        path: "checkout",
        element: (
          <LazyWrapper>
            <Checkout />
          </LazyWrapper>
        ),
      },
      {
        path: "order-success/:orderId",
        element: (
          <LazyWrapper>
            <OrderSuccess />
          </LazyWrapper>
        ),
      },
      {
        path: "account",
        Component: Account,
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <AccountDashboard />
              </LazyWrapper>
            ),
          },
          {
            path: "profile",
            element: (
              <LazyWrapper>
                <AccountProfile />
              </LazyWrapper>
            ),
          },
          {
            path: "orders",
            element: (
              <LazyWrapper>
                <AccountOrders />
              </LazyWrapper>
            ),
          },
          {
            path: "orders/:orderId",
            element: (
              <LazyWrapper>
                <AccountOrderDetail />
              </LazyWrapper>
            ),
          },
          {
            path: "addresses",
            element: (
              <LazyWrapper>
                <AccountAddresses />
              </LazyWrapper>
            ),
          },
          {
            path: "wishlist",
            element: (
              <LazyWrapper>
                <AccountWishlist />
              </LazyWrapper>
            ),
          },
          {
            path: "membership",
            element: (
              <LazyWrapper>
                <AccountMembership />
              </LazyWrapper>
            ),
          },
          {
            path: "newsletter",
            element: (
              <LazyWrapper>
                <AccountNewsletter />
              </LazyWrapper>
            ),
          },
          {
            path: "settings",
            element: (
              <LazyWrapper>
                <AccountSettings />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: "admin",
        Component: Admin,
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <AdminDashboard />
              </LazyWrapper>
            ),
          },
          {
            path: "dashboard",
            element: (
              <LazyWrapper>
                <AdminDashboard />
              </LazyWrapper>
            ),
          },
          {
            path: "products",
            element: (
              <LazyWrapper>
                <AdminProducts />
              </LazyWrapper>
            ),
          },
          {
            path: "orders",
            element: (
              <LazyWrapper>
                <AdminOrders />
              </LazyWrapper>
            ),
          },
          {
            path: "users",
            element: (
              <LazyWrapper>
                <AdminUsers />
              </LazyWrapper>
            ),
          },
          {
            path: "campaigns",
            element: (
              <LazyWrapper>
                <AdminCampaigns />
              </LazyWrapper>
            ),
          },
          {
            path: "settings",
            element: (
              <LazyWrapper>
                <AdminSettings />
              </LazyWrapper>
            ),
          },
        ],
      },
    ],
  },
]);
