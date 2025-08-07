// Calendar Icons
export const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="calendarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.4"/>
      </linearGradient>
    </defs>
    <rect x="3" y="4" width="18" height="18" rx="4" fill="url(#calendarGrad)" fillOpacity="0.1"/>
    <path d="M8 2v4m8-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
    <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
    <circle cx="8" cy="14" r="1.5" fill="currentColor" fillOpacity="0.6"/>
    <circle cx="12" cy="14" r="1.5" fill="currentColor" fillOpacity="0.6"/>
    <circle cx="16" cy="14" r="1.5" fill="currentColor" fillOpacity="0.6"/>
    <circle cx="8" cy="18" r="1.5" fill="currentColor" fillOpacity="0.6"/>
    <circle cx="12" cy="18" r="1.5" fill="currentColor" fillOpacity="0.6"/>
    <circle cx="16" cy="18" r="1.5" fill="currentColor" fillOpacity="0.6"/>
  </svg>
);

// Users & Clients Icons
export const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export const ClientsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="clientGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
      </radialGradient>
    </defs>
    <circle cx="12" cy="8" r="5" fill="url(#clientGrad)" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7"/>
    <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" fill="none"/>
  </svg>
);

// Services Icons
export const ServicesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// Products Icons
export const ProductsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

// Branches Icons
export const BranchesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// Appointments Icons
export const AppointmentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// Analytics Icons
export const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>
);

// Settings Icons
export const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5L19 12l-2.5 2.5m-9-9L5 12l2.5 2.5"/>
  </svg>
);

// Catalog/Inventory Icons
export const CatalogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="catalogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.7"/>
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
      </linearGradient>
    </defs>
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#catalogGrad)" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8"/>
    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
  </svg>
);

// My Agenda Icons
export const AgendaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
  </svg>
);

// Admin Panel Icons
export const AdminIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1l8 3v8c0 8-8 11-8 11s-8-3-8-11V4l8-3z"/>
    <circle cx="12" cy="11" r="3"/>
  </svg>
);

// Packages Icons
export const PackagesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z"/>
    <path d="M3.29 7 12 12l8.71-5"/>
    <path d="M12 22V12"/>
  </svg>
);