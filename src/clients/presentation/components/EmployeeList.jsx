import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../shared/hooks/useUserRole.js';
import { SearchBar } from '../../../shared/components/SearchBar';
import Spinner from '../../../shared/components/Spinner';

export const EmployeeList = ({ 
  employees = [], 
  onEdit, 
  onToggleStatus,
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const { user, isAdmin } = useUserRole();
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [copiedEmail, setCopiedEmail] = useState(null);

  // Función para verificar si es el usuario actual
  const isCurrentUser = (employee) => {
    if (!user) return false;
    
    return user.id === employee.id || String(user.id) === String(employee.id);
  };

  // Función para verificar si se puede activar/desactivar un usuario
  const canToggleStatus = (employee) => {
    if (!isAdmin) return false;
    
    // Admin no puede desactivar su propia cuenta
    if (isCurrentUser(employee)) return false;
    
    // Admin no puede desactivar otros admins
    if (employee.role === 'administrator') return false;
    
    return true;
  };

  // Función para verificar si se puede editar un usuario
  const canEditUser = (employee) => {
    if (!isAdmin) return false;
    
    // No se puede editar usuarios desactivados
    if (!employee.isActive) return false;
    
    return true;
  };

  // Función para copiar email al clipboard
  const copyEmail = async (email, employeeId) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(employeeId);
      setTimeout(() => setCopiedEmail(null), 2000); // Limpiar después de 2 segundos
    } catch (error) {
      console.error('Error copying email:', error);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
      setCopiedEmail(employeeId);
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };


  // Actualizar filteredEmployees cuando cambie employees
  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleSearch = async (searchTerm) => {
    // Búsqueda local siempre (no depende del padre)
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = employees.filter(employee => {
      return (
        (employee.fullName && employee.fullName.toLowerCase().includes(term)) ||
        (employee.firstName && employee.firstName.toLowerCase().includes(term)) ||
        (employee.lastName && employee.lastName.toLowerCase().includes(term)) ||
        (employee.email && employee.email.toLowerCase().includes(term))
      );
    });
    setFilteredEmployees(filtered);
    
    console.log('Búsqueda:', searchTerm, 'Resultados:', filtered.length);
  };


  const getRoleColor = (role) => {
    const colors = {
      'administrator': 'role-admin',
      'receptionist': 'role-receptionist',
      'esthetician': 'role-esthetician',
      'user': 'role-user'
    };
    return colors[role] || 'role-default';
  };

  if (isLoading) {
    return (
      <div className="employee-list-loading">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="employee-list">
      <SearchBar 
        placeholder={t('users.search.placeholder', 'Buscar por nombre, apellido o email...')}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* Results Summary */}
      <div className="results-summary">
        <div className="results-count">
          <h3>{t('users.list.employees_list', 'Lista de Empleados')}</h3>
          <span className="count-badge">
            {filteredEmployees.length} {t('users.list.employees_count', 'empleados')}
          </span>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>{t('users.list.no_employees', 'No hay empleados')}</h3>
          <p>{employees.length === 0 ? 
            t('users.list.no_employees_desc', 'Comienza registrando tu primer empleado') :
            t('users.list.no_results', 'No se encontraron empleados con la búsqueda actual')
          }</p>
        </div>
      ) : (
        <div className="list-grid">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className={`branch-card ${employee.isActive ? 'active' : 'inactive'}`}>
              <div className="card-header">
                <div className="branch-info">
                  <div className="employee-avatar">
                    <span>{employee.firstName?.[0]}{employee.lastName?.[0]}</span>
                  </div>
                  <div className="employee-info">
                    <h4>{employee.fullName}</h4>
                    <p className="employee-email" title={employee.email}>{employee.email}</p>
                    <span className={`role-badge ${getRoleColor(employee.role)}`}>
                      {employee.getRoleDisplay(t)}
                    </span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button
                    onClick={() => copyEmail(employee.email, employee.id)}
                    className={`btn-icon copy-btn ${copiedEmail === employee.id ? 'copied' : ''}`}
                    title={copiedEmail === employee.id ? t('common.copied', '¡Copiado!') : t('common.copy_email', 'Copiar email')}
                  >
                    {copiedEmail === employee.id ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5,15H4a2,2 0,0 1,-2,-2V4A2,2 0,0 1,4,2H15a2,2 0,0 1,2,2V5"/>
                      </svg>
                    )}
                  </button>
                  {canEditUser(employee) && (
                    <button
                      onClick={() => onEdit(employee)}
                      className="btn-icon edit-btn"
                      title={t('common.edit', 'Editar')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onToggleStatus(employee)}
                    className={`btn-icon status-btn ${employee.isActive ? 'deactivate' : 'activate'} ${!canToggleStatus(employee) ? 'disabled' : ''}`}
                    title={
                      !canToggleStatus(employee) 
                        ? (isCurrentUser(employee) 
                            ? t('users.validation.cannot_deactivate_self', 'No puedes desactivar tu propia cuenta')
                            : t('users.validation.cannot_deactivate_admin', 'No puedes desactivar administradores')
                          )
                        : (employee.isActive ? t('common.deactivate', 'Desactivar') : t('common.activate', 'Activar'))
                    }
                    disabled={!canToggleStatus(employee)}
                  >
                    {employee.isActive ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="9"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="9"/>
                        <polyline points="9,11 12,14 22,4"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div className="card-footer">
                  <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                    {employee.isActive ? t('common.active', 'Activo') : t('common.inactive', 'Inactivo')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};