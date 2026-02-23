import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import Root from "../Pages/Root";
import Loading from "../components/Loading";
import PrivateRoute from "../components/PrivateRoute";
import AdminRoute from "../components/AdminRoute";
import AuthWrapper from "../Pages/Auth/AuthWrapper";

// Lazy load all pages
const Home = lazy(() => import("../Pages/Home"));
const About = lazy(() => import("../Pages/About"));
const Category = lazy(() => import("../Pages/Category"));
const Collection = lazy(() => import("../Pages/Collection"));
const ProductDetail = lazy(() => import("../Pages/ProductDetail"));
const Search = lazy(() => import("../Pages/Search"));
const Cart = lazy(() => import("../Pages/Cart"));
const Wishlist = lazy(() => import("../Pages/Wishlist"));
const NewArrivals = lazy(() => import("../Pages/NewArrivals"));
const Campaigns = lazy(() => import("../Pages/Campaigns"));
const Checkout = lazy(() => import("../Pages/Checkout"));
const OrderSuccess = lazy(() => import("../Pages/OrderSuccess"));
const Account = lazy(() => import("../Pages/Account/Account"));
const AccountDashboard = lazy(() => import("../Pages/Account/Dashboard"));
const AccountProfile = lazy(() => import("../Pages/Account/Profile"));
const AccountOrders = lazy(() => import("../Pages/Account/Orders"));
const AccountOrderDetail = lazy(() => import("../Pages/Account/OrderDetail"));
const AccountAddresses = lazy(() => import("../Pages/Account/Addresses"));
const AccountWishlist = lazy(() => import("../Pages/Account/Wishlist"));
const AccountCart = lazy(() => import("../Pages/Account/AccountCart"));
const AccountMembership = lazy(() => import("../Pages/Account/Membership"));
const AccountNewsletter = lazy(() => import("../Pages/Account/Newsletter"));
const AccountSettings = lazy(() => import("../Pages/Account/Settings"));
const AccountSecurity = lazy(() => import("../Pages/Account/Security"));
const Admin = lazy(() => import("../Pages/Admin/Admin"));
const AdminDashboard = lazy(() => import("../Pages/Admin/Dashboard"));
const AdminProducts = lazy(() => import("../Pages/Admin/Products"));
const AdminOrders = lazy(() => import("../Pages/Admin/Orders"));
const AdminUsers = lazy(() => import("../Pages/Admin/Users"));
const AdminCampaigns = lazy(() => import("../Pages/Admin/Campaigns"));
const AdminFaq = lazy(() => import("../Pages/Admin/Faq"));
const AdminProductCreate = lazy(() => import("../Pages/Admin/ProductCreate"));

const Contact = lazy(() => import("../Pages/Contact"));
const SizeGuide = lazy(() => import("../Pages/SizeGuide"));
const FAQ = lazy(() => import("../Pages/FAQ"));
const StoreLocator = lazy(() => import("../Pages/StoreLocator"));
const Privacy = lazy(() => import("../Pages/Privacy"));
const Terms = lazy(() => import("../Pages/Terms"));

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
        path: "contact",
        element: (
          <LazyWrapper>
            <Contact />
          </LazyWrapper>
        ),
      },
      {
        path: "size-guide",
        element: (
          <LazyWrapper>
            <SizeGuide />
          </LazyWrapper>
        ),
      },
      {
        path: "faq",
        element: (
          <LazyWrapper>
            <FAQ />
          </LazyWrapper>
        ),
      },
      {
        path: "stores",
        element: (
          <LazyWrapper>
            <StoreLocator />
          </LazyWrapper>
        ),
      },
      {
        path: "privacy",
        element: (
          <LazyWrapper>
            <Privacy />
          </LazyWrapper>
        ),
      },
      {
        path: "terms",
        element: (
          <LazyWrapper>
            <Terms />
          </LazyWrapper>
        ),
      },
      {
        path: "category/:categoryName/:section?/:subcategory?",
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
        path: "wishlist",
        element: (
          <LazyWrapper>
            <Wishlist />
          </LazyWrapper>
        ),
      },
      {
        path: "new-arrivals",
        element: (
          <LazyWrapper>
            <NewArrivals />
          </LazyWrapper>
        ),
      },
      {
        path: "campaigns",
        element: (
          <LazyWrapper>
            <Campaigns />
          </LazyWrapper>
        ),
      },
      {
        path: "sale",
        element: <Navigate to="/campaigns" replace />,
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
        element: (
          <PrivateRoute>
            <LazyWrapper>
              <Account />
            </LazyWrapper>
          </PrivateRoute>
        ),
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
            path: "cart",
            element: (
              <LazyWrapper>
                <AccountCart />
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
            path: "security",
            element: (
              <LazyWrapper>
                <AccountSecurity />
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
        element: (
          <AdminRoute>
            <LazyWrapper>
              <Admin />
            </LazyWrapper>
          </AdminRoute>
        ),
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
            path: "products/new",
            element: (
              <LazyWrapper>
                <AdminProductCreate />
              </LazyWrapper>
            ),
          },
          {
            path: "products/:productId/edit",
            element: (
              <LazyWrapper>
                <AdminProductCreate />
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
            path: "faq",
            element: (
              <LazyWrapper>
                <AdminFaq />
              </LazyWrapper>
            ),
          },
        ],
      },
    ],
  },
]);
