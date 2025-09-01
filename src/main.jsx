// src/main.jsx
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./App.css";

// PUBLIC layout & pages
const SiteLayout      = lazy(() => import("./layout/SiteLayout.jsx"));
const Home            = lazy(() => import("./pages/Home.jsx"));
const PublicMenu      = lazy(() => import("./pages/PublicMenu.jsx"));
const Contact         = lazy(() => import("./pages/Contact.jsx"));
const About           = lazy(() => import("./pages/About.jsx"));

// Auth pages (без layout!)
const Login           = lazy(() => import("./pages/Login.jsx"));
const Logout          = lazy(() => import("./pages/Logout.jsx"));

// ADMIN layout & pages
const AdminLayout     = lazy(() => import("./layout/AdminLayout.jsx"));
const CategoriesTable = lazy(() => import("./pages/CategoriesTable.jsx"));
const DishesTable     = lazy(() => import("./pages/DishesTable.jsx"));
const Orders          = lazy(() => import("./pages/Orders.jsx"));
const OrdersBoard     = lazy(() => import("./pages/OrdersBoard.jsx"));
const OrderCreate = lazy(() => import("./pages/OrderCreate.jsx"));
const OrdersReport = lazy(() => import("./pages/OrdersReport.jsx"));

import RoleRoute from "./routes/RoleRoute.jsx";

const suspense = (el) => (
  <Suspense fallback={<div className="page-loading">Зареждане…</div>}>{el}</Suspense>
);

const NotFound = () => <div style={{ padding: 24 }}>Страницата не е намерена.</div>;

const router = createBrowserRouter([
  // === PUBLIC (с публичния layout) ===
  {
    element: suspense(<SiteLayout />),
    children: [
      { index: true,     element: suspense(<Home />) },
      { path: "menu",    element: suspense(<PublicMenu />) },
      { path: "contact", element: suspense(<Contact />) },
      { path: "about",   element: suspense(<About />) },
      { path: "*",       element: <NotFound /> },
    ],
  },

  // === AUTH (без никакъв layout – няма хедър/футър) ===
  { path: "/login",  element: suspense(<Login />) },
  { path: "/logout", element: suspense(<Logout />) },

  // === ADMIN (с отделен AdminLayout, пазен от RoleRoute) ===
  {
    path: "/admin",
    element: (
      <RoleRoute roles={["admin", "staff"]}>
        {suspense(<AdminLayout />)}
      </RoleRoute>
    ),
    children: [
      { index: true, element: <Navigate to="orders/kitchen" replace /> },

      // админ само
      {
        path: "categories",
        element: (
          <RoleRoute roles={["admin"]}>
            {suspense(<CategoriesTable />)}
          </RoleRoute>
        ),
      },
      {
        path: "dishes",
        element: (
          <RoleRoute roles={["admin"]}>
            {suspense(<DishesTable />)}
          </RoleRoute>
        ),
      },

      // поръчки – admin + staff
      {
        path: "orders",
        element: suspense(<Orders />),
        children: [
          { index: true,     element: <Navigate to="kitchen" replace /> },
          { path: "kitchen", element: suspense(<OrdersBoard station="kitchen" />) },
          { path: "bar",     element: suspense(<OrdersBoard station="bar" />) },
        ],
      },
      {
        path: "orders/create",
        element: (
          <RoleRoute roles={["admin", "staff"]}>
            {suspense(<OrderCreate />)}
          </RoleRoute>
        ),
      },
      {
        path: "orders",
        element: suspense(<Orders />),
        children: [
          { index: true, element: <Navigate to="kitchen" replace /> },
          { path: "kitchen", element: suspense(<OrdersBoard station="kitchen" />) },
          { path: "bar",     element: suspense(<OrdersBoard station="bar" />) },
          { path: "report",  element: suspense(<OrdersReport />) },   // <-- ново
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
