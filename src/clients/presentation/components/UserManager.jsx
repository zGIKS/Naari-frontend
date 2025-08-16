import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../shared/components/ToastProvider';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeList } from './EmployeeList';
import { UserStatusConfirmationModal } from '../../../shared/components/UserStatusConfirmationModal';
import Spinner from '../../../shared/components/Spinner';

/**
 * UserManager - Componente para gestión de usuarios/empleados en admin panel
 */
export const UserManager = ({ userFactory, catalogFactory }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    user: null,
    action: null // 'activate' or 'deactivate'
  });

  // Definir loadEmployees primero
  const loadEmployees = useCallback(async (searchQuery = '') => {
    if (!userFactory) return;

    setIsLoadingEmployees(true);
    try {
      const userService = userFactory.createUserService(t);
      const response = await userService.getAllEmployees(searchQuery);

      if (response.success) {
        setEmployees(response.data);
      } else {
        showError( response.error || t('users.error.load_employees_failed', 'Error al cargar empleados'));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      showError( t('users.error.network', 'Error de conexión'));
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [userFactory, t, showError]);

  const loadBranches = useCallback(async () => {
    if (!catalogFactory) return;

    setIsLoadingBranches(true);
    try {
      const branchService = catalogFactory.getBranchService();
      const branches = await branchService.getAllBranches();
      setBranches(branches.filter(branch => branch.isActive));
    } catch (error) {
      console.error('Error loading branches:', error);
      showError( t('users.error.network', 'Error de conexión'));
    } finally {
      setIsLoadingBranches(false);
    }
  }, [catalogFactory, t, showError]);

  // Cargar datos al montar el componente
  useEffect(() => {
    // Solo cargar si tenemos los factories y no hemos cargado aún
    if (catalogFactory && userFactory && branches.length === 0) {
      loadBranches();
    }
  }, [catalogFactory, userFactory, branches.length, loadBranches]);

  useEffect(() => {
    // Solo cargar empleados si tenemos userFactory y no hemos cargado aún
    if (userFactory && employees.length === 0) {
      loadEmployees();
    }
  }, [userFactory, employees.length, loadEmployees]);

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
        showSuccess( t('users.success.created', 'Empleado registrado exitosamente'));
      } else {
        showError( response.error || t('users.error.create_failed', 'Error al crear empleado'));
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      showError( t('users.error.network', 'Error de conexión'));
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
        
        showSuccess( t('users.success.updated', 'Empleado actualizado exitosamente'));
      } else {
        showError( response.error || t('users.error.update_failed', 'Error al actualizar empleado'));
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      showError( t('users.error.network', 'Error de conexión'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleToggleEmployeeStatus = (employee) => {
    const action = employee.isActive ? 'deactivate' : 'activate';
    setConfirmationModal({
      isOpen: true,
      user: employee,
      action: action
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!userFactory || !confirmationModal.user) return;

    try {
      const userService = userFactory.createUserService(t);
      const employee = confirmationModal.user;
      const response = confirmationModal.action === 'deactivate'
        ? await userService.deactivateEmployee(employee.id)
        : await userService.activateEmployee(employee.id);

      if (response.success) {
        await loadEmployees();
        const message = response.message || (confirmationModal.action === 'deactivate'
          ? t('users.success.deactivated', 'Empleado desactivado exitosamente')
          : t('users.success.activated', 'Empleado activado exitosamente')
        );
        showSuccess(message);
      } else {
        showError(response.error || t('users.error.status_change_failed', 'Error al cambiar estado'));
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      showError(t('users.error.network', 'Error de conexión'));
    } finally {
      setConfirmationModal({
        isOpen: false,
        user: null,
        action: null
      });
    }
  };

  const handleCancelStatusChange = () => {
    setConfirmationModal({
      isOpen: false,
      user: null,
      action: null
    });
  };


  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };


  if (!userFactory || !catalogFactory) {
    return (
      <div className="user-manager-loading">
        <Spinner />
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
              onEdit={handleEditEmployee}
              onToggleStatus={handleToggleEmployeeStatus}
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

      <UserStatusConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        user={confirmationModal.user}
        action={confirmationModal.action}
      />

    </div>
  );
};