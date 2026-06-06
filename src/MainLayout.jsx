import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

export default function MainLayout() {
  return (
    <div className="wrapper">
      <Topbar />
      <Sidebar />
      <div className="content-wrapper">
        <Outlet />
      </div>

      <footer className="main-footer">
        <div class="float-right d-none d-sm-block">
          <b>Version</b> 3.1.0
        </div>
        <strong>Copyright &copy; 2014-2021 <a href="https://adminlte.io">AdminLTE.io</a>.</strong> All rights reserved.
      </footer>      
    </div>
  
  );
}
