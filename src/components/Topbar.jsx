import useAuth from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i class="fas fa-bars"></i>
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block"><a onClick={() => navigate('/?view=ai-chat')} style={{ cursor: 'pointer' }} className="nav-link">Home</a></li>
      </ul>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <a className="nav-link">
            <span className="nav-link d-none d-md-inline">{user?.name || 'User'}</span>
          </a>
        </li>
        <li className="nav-item">
          <button type="button" className="btn btn-danger" onClick={logout}>Sign out</button>
        </li>
      </ul>
    </nav>
  );
}
