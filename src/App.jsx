import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';

import AdminLayout from './layout/AdminLayout';      // ВАЖНО: правилен път
import StaffPage from './pages/StaffPage';
import DishesTable from './pages/DishesTable';
import CategoriesTable from './pages/CategoriesTable';

import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import Login from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/login" element={<Login />} />

          {/* Админ дърво с вложени маршрути */}
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
          </Route>

          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
