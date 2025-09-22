// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';

import SiteLayout from './layout/SiteLayout';
import AdminLayout from './layout/AdminLayout';

import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFoundPublic from './pages/NotFoundPublic';

import StaffPage from './pages/StaffPage';
import DishesTable from './pages/DishesTable';
import CategoriesTable from './pages/CategoriesTable';
import NotFoundAdmin from './pages/NotFoundAdmin';

import LoaderOverlay from './components/LoaderOverlay';
import { LoadingProvider, useLoading } from './loading';
import { RouteChangeLoader, AxiosLoader } from './LoaderBridges';

function LoaderGate() {
  const { loading } = useLoading();
  return <LoaderOverlay loading={loading} />;
}

export default function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          {/* Глобален overlay + тригери за route/axios */}
          <LoaderGate />
          <RouteChangeLoader />
          <AxiosLoader />

          <Routes>
            {/* Публично дърво под SiteLayout */}
            <Route element={<SiteLayout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<NotFoundPublic />} />
            </Route>

            {/* Админ дърво */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<DishesTable />} />
              <Route path="categories" element={<CategoriesTable />} />
              <Route
                path="staff"
                element={
                  <RequireRole roles={['admin']}>
                    <StaffPage />
                  </RequireRole>
                }
              />
              <Route path="*" element={<NotFoundAdmin />} />
            </Route>

            {/* Login извън публичния layout */}
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  );
}
