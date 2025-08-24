// src/main.jsx
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./App.css";

const SiteLayout      = lazy(() => import("./layout/SiteLayout.jsx"));
const Home            = lazy(() => import("./pages/Home.jsx"));
const PublicMenu      = lazy(() => import("./pages/PublicMenu.jsx"));
const Contact         = lazy(() => import("./pages/Contact.jsx"));
const Admin           = lazy(() => import("./pages/Admin.jsx"));
const CategoriesTable = lazy(() => import("./pages/CategoriesTable.jsx"));
const DishesTable     = lazy(() => import("./pages/DishesTable.jsx"));

const NotFound = () => <div style={{ padding: 24 }}>Страницата не е намерена.</div>;
const suspense = (el) => <Suspense fallback={<div className="page-loading">Зареждане…</div>}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    element: suspense(<SiteLayout />),         // Header → Content → Footer
    children: [
      { index: true, element: suspense(<Home />) },         // /
      { path: "menu",    element: suspense(<PublicMenu />) }, // /menu
      { path: "contact", element: suspense(<Contact />) },    // /contact
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin",                             // Админ със собствен layout (sidebar)
    element: suspense(<Admin />),
    children: [
      { index: true, element: <Navigate to="categories" replace /> },
      { path: "categories", element: suspense(<CategoriesTable />) },
      { path: "dishes",     element: suspense(<DishesTable />) },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
