import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeList } from './EmployeeList';
import Toast from '../../../shared/components/Toast';

/**
 * UserManager - Componente para gestión de usuarios/empleados en admin panel
 */
export const UserManager = ({ userFactory, catalogFactory }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [toast, setToast] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadBranches();
    loadEmployees();
  }, [catalogFactory, userFactory]);

  const loadBranches = async () => {
    if (!catalogFactory) return;

    setIsLoadingBranches(true);
    try {
      const branchService = catalogFactory.getBranchService();
      const branches = await branchService.getAllBranches();
      setBranches(branches.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
      showToast('error', t('users.error.network', 'Error de conexión'));
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const loadEmployees = useCallback(async (searchQuery = '') => {
    if (!userFactory) return;

    setIsLoadingEmployees(true);
    try {
      const userService = userFactory.createUserService(t);
      const response = await userService.getAllEmployees(searchQuery);

      if (response.success) {
        setEmployees(response.data);
      } else {
        showToast('error', response.error || t('users.error.load_employees_failed', 'Error al cargar empleados'));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      showToast('error', t('users.error.network', 'Error de conexión'));
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [userFactory, t]);

  const handleCreateEmployee = async (employeeData) => {
    if (!userFactory) return;

    setIsSubmitting(true);
    try {
      const userService = userFactory.createUserService(t);
      const response = await userService.createEmployee(employeeData);

      if (response.success) {
        setShowForm(false);
        setEditingEmployee(null);
        await loadEmployees();
        showToast('success', t('users.success.created', 'Empleado registrado exitosamente'));
      } else {
        showToast('error', response.error || t('users.error.create_failed', 'Error al crear empleado'));
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      showToast('error', t('users.error.network', 'Error de conexión'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (employeeData) => {
    if (!userFactory || !editingEmployee) return;

    setIsSubmitting(true);
    try {
      const userService = userFactory.createUserService(t);
      const response = await userService.updateEmployee(editingEmployee.id, employeeData, editingEmployee);

      if (response.success) {
        setShowForm(false);
        setEditingEmployee(null);
        
        // Forzar recarga completa de empleados para reflejar cambios del backend
        console.log('Employee updated successfully, reloading employee list...');
        await loadEmployees();
        
        showToast('success', t('users.success.updated', 'Empleado actualizado exitosamente'));
      } else {
        showToast('error', response.error || t('users.error.update_failed', 'Error al actualizar empleado'));
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      showToast('error', t('users.error.network', 'Error de conexión'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleToggleEmployeeStatus = async (employee) => {
    if (!userFactory) return;

    try {
      const userService = userFactory.createUserService(t);
      const response = employee.isActive 
        ? await userService.deactivateEmployee(employee.id)
        : await userService.activateEmployee(employee.id);

      if (response.success) {
        await loadEmployees();
        const message = response.message || (employee.isActive 
          ? t('users.success.deactivated', 'Empleado desactivado exitosamente')
          : t('users.success.activated', 'Empleado activado exitosamente')
        );
        showToast('success', message);
      } else {
        showToast('error', response.error || t('users.error.status_change_failed', 'Error al cambiar estado'));
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      showToast('error', t('users.error.network', 'Error de conexión'));
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleSearch = useCallback(async (searchTerm) => {
    await loadEmployees(searchTerm);
  }, [loadEmployees]);

  if (!userFactory || !catalogFactory) {
    return (
      <div className="user-manager-loading">
        <div className="spinner"></div>
        <p>{t('common.loading', 'Cargando...')}</p>
      </div>
    );
  }

  return (
    <div className="user-manager">
      {!showForm ? (
        <>
          <div className="manager-header">
            <div className="header-content">
              <h2>{t('users.title', 'Gestión de Empleados')}</h2>
              <p>{t('users.subtitle', 'Administra usuarios y empleados del sistema')}</p>
            </div>
            
            <div className="header-actions">
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
                disabled={isLoadingBranches}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <line x1="12" y1="11" x2="12" y2="17"/>
                  <line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
                {t('users.actions.new_employee', 'Nuevo Empleado')}
              </button>
            </div>
          </div>

          <div className="manager-content">
            <EmployeeList
              employees={employees}
              branches={branches}
              onEdit={handleEditEmployee}
              onToggleStatus={handleToggleEmployeeStatus}
              onSearch={handleSearch}
              isLoading={isLoadingEmployees}
            />
          </div>
        </>
      ) : (
        <>
          <div className="manager-header">
            <div className="header-content">
              <h2>
                {editingEmployee 
                  ? t('users.form.edit_title', 'Editar Empleado')
                  : t('users.form.title', 'Registrar Nuevo Empleado')
                }
              </h2>
              <p>
                {editingEmployee
                  ? t('users.form.edit_subtitle', 'Modifica la información del empleado')
                  : t('users.form.subtitle', 'Complete la información del empleado y asigne rol y sucursal')
                }
              </p>
            </div>
          </div>

          <div className="manager-content">
            <div className="form-container">
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
                onCancel={handleCancelForm}
                isLoading={isSubmitting}
                branches={branches}
              />
            </div>
          </div>
        </>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
        />
      )}
    </div>
  );
};