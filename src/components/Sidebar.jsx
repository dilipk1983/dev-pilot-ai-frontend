/* eslint-disable jsx-a11y/anchor-is-valid */
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse the 'view' param from URL query string
  const params = new URLSearchParams(location.search);
  const activeView = params.get('view') || 'ai-chat'; // default to ai-chat if none

  // Helper function to check if a nav item is active
  const isActive = (viewName) => activeView === viewName;

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4" data-bs-theme="dark">

      <a href="/" className="brand-link">
        <img src="/images/AdminLTELogo.png"
          alt="AdminLTE Logo"
          className="brand-image img-circle elevation-3"
          style={{ opacity: '.8' }} ></img>
        <span className="brand-text font-weight-light">AdminLTE 3</span>
      </a>
      <div class="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            <li className="nav-item">
              <a
                onClick={() => navigate('/?view=ai-chat')}
                className={`nav-link ${isActive('ai-chat') ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <i className="nav-icon bi bi-grid"></i>
                <p>AI Chat</p>
              </a>
            </li>
            <li className="nav-item">
              <a
                onClick={() => navigate('/?view=reports')}
                className={`nav-link ${isActive('reports') ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <i className="nav-icon bi bi-database-lock"></i>
                <p>Reports</p>
              </a>
            </li>
            <li className="nav-item">
              <a
                onClick={() => navigate('/?view=database-credentials')}
                className={`nav-link ${isActive('database-credentials') ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <i className="nav-icon bi bi-wallet2"></i>
                <p>Database Credentials</p>
              </a>
            </li>

            <li className="nav-item">
              <a
                onClick={() => navigate('/?view=cards')}
                className={`nav-link ${isActive('cards') ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <i className="nav-icon bi bi-wallet2"></i>
                <p>Cards</p>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
