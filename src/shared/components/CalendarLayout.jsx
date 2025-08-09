import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const CalendarLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  return (
    <div className="Calendar-layout">
      <Header 
        onToggleSidebar={toggleSidebar} 
        sidebarOpen={sidebarOpen}
      />
      
      <div className="Calendar-content-wrapper">
        <Sidebar 
          isOpen={sidebarOpen}
        />
        
        <main className={`Calendar-main ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          <div className="Calendar-main-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarLayout;