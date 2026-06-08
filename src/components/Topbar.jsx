import useAuth from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      <ul className="navbar-nav">
        <li className="nav-item">
          <button
            type="button"
            className="nav-link btn btn-link"
            data-widget="pushmenu"
            aria-label="Toggle navigation menu"
          >
            <i className="fas fa-bars"></i>
          </button>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <button
            type="button"
            onClick={() => navigate('/?view=ai-chat')}
            className="nav-link btn btn-link"
          >
            Home
          </button>
        </li>
      </ul>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <span className="nav-link d-none d-md-inline">{user?.name || 'User'}</span>
        </li>
        <li className="nav-item">
          <button type="button" className="btn btn-danger" onClick={logout}>Sign out</button>
        </li>
      </ul>
    </nav>
  );
}
