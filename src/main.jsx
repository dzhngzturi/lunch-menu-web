// src/main.jsx
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth";
import LoaderOverlay from "./components/LoaderOverlay.jsx";

// PUBLIC
const SiteLayout      = lazy(() => import("./layout/SiteLayout.jsx"));
const Home            = lazy(() => import("./pages/Home.jsx"));
const PublicMenu      = lazy(() => import("./pages/PublicMenu.jsx"));
const Contact         = lazy(() => import("./pages/Contact.jsx"));
const About           = lazy(() => import("./pages/About.jsx"));
const DishDetails     = lazy(() => import("./pages/DishDetails.jsx"));
// AUTH
const Login           = lazy(() => import("./pages/Login.jsx"));
const Logout          = lazy(() => import("./pages/Logout.jsx"));

// ADMIN
const NotFoundAdmin   = lazy(() => import("./pages/NotFoundAdmin.jsx"));
const NotFoundPublic  = lazy(() => import("./pages/NotFoundPublic.jsx"));
const AdminDashboard  = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminLayout     = lazy(() => import("./layout/AdminLayout.jsx"));
const CategoriesTable = lazy(() => import("./pages/CategoriesTable.jsx"));
const DishesTable     = lazy(() => import("./pages/DishesTable.jsx"));
const DishNew         = lazy(() => import("./pages/DishNew.jsx"));
const Orders          = lazy(() => import("./pages/Orders.jsx"));
const OrdersBoard     = lazy(() => import("./pages/OrdersBoard.jsx"));
const OrdersReport    = lazy(() => import("./pages/OrdersReport.jsx"));
const OrderCreate     = lazy(() => import("./pages/OrderCreate.jsx"));
const StaffPage       = lazy(() => import("./pages/StaffPage.jsx"));

import RequireAuth from "./components/RequireAuth.jsx";
import RequireRole from "./components/RequireRole.jsx";

// Помощник: Suspense с нашия оувърлей
const suspense = (el, { backdrop = "rgba(255,255,255,0.0)", text = "Зареждам…" } = {}) => (
  <Suspense
    fallback={
      <LoaderOverlay
        text={text}
        color="#3b82f6"      // син
        size={54}
        backdrop={backdrop}  // прозрачен по подразбиране
      />
    }
  >
    {el}
  </Suspense>
);

const router = createBrowserRouter([
  // === PUBLIC ===
  {
    // За layout-а: пълен бял фон (първоначално)
    element: suspense(<SiteLayout />, { backdrop: "#ffffff", text: "Зареждам сайта…" }),
    children: [
      { index: true,     element: suspense(<Home />) },
      { path: "menu",    element: suspense(<PublicMenu />) },
      { path: "menu/dish/:id", element: suspense(<DishDetails />) },
      { path: "contact", element: suspense(<Contact />) },
      { path: "about",   element: suspense(<About />) },
      { path: "*",       element: suspense(<NotFoundPublic />) },
    ],
  },

  // === AUTH ===
  { path: "/login",  element: suspense(<Login />) },
  { path: "/logout", element: suspense(<Logout />) },

  // === ADMIN ===
  {
    path: "/admin",
    element: (
      <RequireAuth>
        {/* За AdminLayout – прозрачен бекдроп, за да си личи app-shell */}
        {suspense(<AdminLayout />, { backdrop: "rgba(255,255,255,0.0)", text: "Зареждам админ панела…" })}
      </RequireAuth>
    ),
    children: [
      { index: true, element: suspense(<AdminDashboard />) },
      // { index: true, element: <Navigate to="dishes" replace /> },

      {
        path: "categories",
        element: (
          <RequireRole roles={["admin"]}>
            {suspense(<CategoriesTable />)}
          </RequireRole>
        ),
      },
      {
        path: "dishes",
        element: (
          <RequireRole roles={["admin"]}>
            {suspense(<DishesTable />)}
          </RequireRole>
        ),
      },
      {
        path: "dishes/new",
        element: (
          <RequireRole roles={["admin"]}>
            {suspense(<DishNew />)}
          </RequireRole>
        ),
      },
      {
        path: "staff",
        element: (
          <RequireRole roles={["admin"]}>
            {suspense(<StaffPage />)}
          </RequireRole>
        ),
      },

      {
        path: "orders",
        element: suspense(<Orders />),
        children: [
          { index: true,       element: <Navigate to="kitchen" replace /> },
          { path: "kitchen",   element: suspense(<OrdersBoard station="kitchen" />) },
          { path: "bar",       element: suspense(<OrdersBoard station="bar" />) },
          { path: "report",    element: suspense(<OrdersReport />) },
        ],
      },
      {
        path: "orders/create",
        element: (
          <RequireRole roles={["admin","staff"]}>
            {suspense(<OrderCreate />)}
          </RequireRole>
        ),
      },

      { path: "*", element: suspense(<NotFoundAdmin />) },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
