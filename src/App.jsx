import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import RequireAuth from './components/RequireAuth';

// твои страници/компоненти
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';       // ако имаш
import AdminPage from './pages/admin/Admin';   // обвива таблиците, или директно плъгни таблици
import Login from './pages/Login';
import DishesTable from './pages/DishesTable'; // вече работи с axios инстанса
import CategoriesTable from './pages/CategoriesTable';

function AdminLayout() {
  const { logout, user } = useAuth();
  return (
    <div className="admin-wrap">
      <div className="admin-topbar">
        <span>Админ {user?.email}</span>
        <button className="btn" onClick={logout}>Изход</button>
      </div>
      {/* сложи тук навигация към подстраници при желание */}
      <div className="admin-content">
        <Routes>
          <Route index element={<DishesTable />} />
          <Route path="categories" element={<CategoriesTable />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
