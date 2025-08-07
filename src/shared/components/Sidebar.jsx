import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigationFactory } from '../factories/NavigationFactory';
import { useUserRole } from '../hooks/useUserRole';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';
import * as SidebarIcons from './SidebarIcons';

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
);

const MoreOptionsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5L19 12l-2.5 2.5m-9-9L5 12l2.5 2.5"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const SidebarItem = ({ item, isActive, onClick, isExpanded, onToggle, location }) => {
  const { t } = useTranslation();
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const isSubItemActive = (subItem) => {
    return location.pathname === subItem.path || 
           (subItem.path !== '/' && location.pathname.startsWith(subItem.path));
  };

  return (
    <div className="sidebar-item">
      <div 
        className={`sidebar-item-main ${isActive ? 'active' : ''} ${hasSubItems ? 'has-subitems' : ''}`}
        onClick={() => hasSubItems ? onToggle() : onClick()}
      >
        <div className="sidebar-item-content">
          <span className="sidebar-item-icon">
            {SidebarIcons[item.icon] ? SidebarIcons[item.icon]() : <span>{item.icon}</span>}
          </span>
          <span className="sidebar-item-label">{t(item.label)}</span>
        </div>
        {hasSubItems && (
          <span className="sidebar-item-chevron">
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </span>
        )}
      </div>
      
      {hasSubItems && isExpanded && (
        <div className="sidebar-subitems">
          {item.subItems.map((subItem, index) => (
            <div 
              key={index}
              className={`sidebar-subitem ${isSubItemActive(subItem) ? 'active' : ''}`}
              onClick={() => onClick(subItem.path)}
            >
              <span className="sidebar-subitem-label">
                {t(`navigation.${subItem.path.replace(/\//g, '.')}`, subItem.label)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isOpen }) => {
  const [navigationItems, setNavigationItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const { userRoles, userRole, permissions, loading } = useUserRole();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const moreOptionsRef = useRef(null);

  useEffect(() => {
    if (!loading && userRoles.length > 0) {
      try {
        const items = NavigationFactory.createSidebarItems(userRoles, permissions);
        const filteredItems = NavigationFactory.filterByPermissions(items, permissions);
        setNavigationItems(filteredItems);
        
        // Auto-expand items that have active subitems
        const newExpandedItems = {};
        filteredItems.forEach(item => {
          if (item.subItems) {
            const hasActiveSubitem = item.subItems.some(subItem => 
              location.pathname === subItem.path || 
              (subItem.path !== '/' && location.pathname.startsWith(subItem.path))
            );
            if (hasActiveSubitem) {
              newExpandedItems[item.id] = true;
            }
          }
        });
        setExpandedItems(prev => ({ ...prev, ...newExpandedItems }));
      } catch (error) {
        console.error('Error creating navigation:', error);
        setNavigationItems([]);
      }
    } else if (!loading) {
      setNavigationItems([]);
    }
  }, [userRoles, permissions, loading, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target)) {
        setIsMoreOptionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleLogout = async () => {
    try {
      const authService = AuthServiceFactory.getInstance();
      await authService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/login';
    }
  };

  const isItemActive = (item) => {
    // Exact match
    if (location.pathname === item.path) {
      return true;
    }
    
    // Check if current path starts with item path (for nested routes)
    if (item.path !== '/' && location.pathname.startsWith(item.path)) {
      return true;
    }
    
    // Check subitems
    if (item.subItems) {
      return item.subItems.some(subItem => 
        location.pathname === subItem.path || 
        (subItem.path !== '/' && location.pathname.startsWith(subItem.path))
      );
    }
    
    return false;
  };

  const handleMoreOptionsClick = (action) => {
    setIsMoreOptionsOpen(false);
    
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={isItemActive(item)}
            onClick={(path) => handleItemClick(path || item.path)}
            isExpanded={expandedItems[item.id]}
            onToggle={() => toggleExpanded(item.id)}
            location={location}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`sidebar-more-options ${isMoreOptionsOpen ? 'open' : ''}`} ref={moreOptionsRef}>
          <button
            type="button"
            onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
            className="more-options-button"
            aria-label={t('sidebar.more_options', 'Más opciones')}
          >
            <div className="more-options-button-content">
              <MoreOptionsIcon />
              <span className="more-options-text">
                {t('sidebar.more_options', 'Más opciones')}
              </span>
            </div>
            <span className="more-options-icon">
              <ChevronDownIcon />
            </span>
          </button>
          
          {isMoreOptionsOpen && (
            <div className="more-options-menu">
              <button
                type="button"
                onClick={() => handleMoreOptionsClick('profile')}
                className="more-options-item"
              >
                <ProfileIcon />
                <span>{t('profile.view', 'Perfil')}</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleMoreOptionsClick('settings')}
                className="more-options-item"
              >
                <SettingsIcon />
                <span>{t('profile.settings', 'Configuración')}</span>
              </button>
              
              <div className="more-options-separator"></div>
              
              <button
                type="button"
                onClick={() => handleMoreOptionsClick('logout')}
                className="more-options-item logout"
              >
                <LogoutIcon />
                <span>{t('profile.logout', 'Cerrar sesión')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;