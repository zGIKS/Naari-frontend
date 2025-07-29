import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  return (
    <div className="dashboard-layout">
      <Header 
        onToggleSidebar={toggleSidebar} 
        sidebarOpen={sidebarOpen}
      />
      
      <div className="dashboard-content-wrapper">
        <Sidebar 
          isOpen={sidebarOpen}
        />
        
        <main className={`dashboard-main ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          <div className="dashboard-main-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;