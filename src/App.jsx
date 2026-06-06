// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import MainLayout from './MainLayout';
import Login from './pages/login/Login';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
              </Route>
            </Route>
          </Routes>

          <ToastContainer position="top-right" autoClose={3000} />
        </>
      </BrowserRouter>
    </AuthProvider>
  );
}
