// src/main.jsx
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth";

// PUBLIC
const SiteLayout      = lazy(() => import("./layout/SiteLayout.jsx"));
const Home            = lazy(() => import("./pages/Home.jsx"));
const PublicMenu      = lazy(() => import("./pages/PublicMenu.jsx"));
const Contact         = lazy(() => import("./pages/Contact.jsx"));
const About           = lazy(() => import("./pages/About.jsx"));

// AUTH
const Login           = lazy(() => import("./pages/Login.jsx"));
const Logout          = lazy(() => import("./pages/Logout.jsx"));

// ADMIN
const NotFound        = lazy(() => import("./pages/NotFound.jsx"));
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

const suspense = (el) => (
  <Suspense fallback={<div className="page-loading">Зареждане…</div>}>{el}</Suspense>
);

const router = createBrowserRouter([
  // === PUBLIC ===
  {
    element: suspense(<SiteLayout />),
    children: [
      { index: true,     element: suspense(<Home />) },
      { path: "menu",    element: suspense(<PublicMenu />) },
      { path: "contact", element: suspense(<Contact />) },
      { path: "about",   element: suspense(<About />) },
      // ⚠️ НЯМА catch-all тук, за да НЕ се рендерира SiteLayout при 404
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
        {suspense(<AdminLayout />)}
      </RequireAuth>
    ),
    children: [
      // ✅ Остави само ЕДИН index (избери какво да е началото на админ панела)
      { index: true, element: suspense(<AdminDashboard />) },
      // или вместо горния ред може:
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

      // 404 САМО за /admin/*
      { path: "*", element: suspense(<NotFound />) },
    ],
  },

  // === ГЛОБАЛЕН 404 (без SiteLayout) ===
  { path: "*", element: suspense(<NotFound />) },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
