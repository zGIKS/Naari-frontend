import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG, API_ENDPOINTS } from '../config/ApiConfig';
import DashboardLayout from '../components/DashboardLayout';
import { AuthServiceFactory } from '../../iam/infrastructure/factories/AuthServiceFactory';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [editingFields, setEditingFields] = useState({
    first_name: false,
    last_name: false,
    email: false,
    password: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const isAdmin = () => {
    return profile?.role === 'administrator' || profile?.roles?.includes('administrator');
  };

  const fetchProfile = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const authService = AuthServiceFactory.getInstance();
      
      // First check if user is still authenticated
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Try to validate session (this will refresh user data)
      const isValidSession = await authService.validateSession();
      
      if (!isValidSession) {
        // Session expired, redirect to login
        navigate('/login');
        return;
      }

      // Get current user data from the session
      const currentUser = authService.getCurrentUser();
      console.log('Profile data received:', currentUser);
      
      if (currentUser) {
        setProfile(currentUser);
        setEditForm({
          first_name: currentUser.first_name || currentUser.firstName || '',
          last_name: currentUser.last_name || currentUser.lastName || '',
          email: currentUser.email || '',
          password: ''
        });
      } else {
        throw new Error('No user data available');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrors({ general: 'Error al cargar los datos del perfil' });
      
      // If it's an authentication error, redirect to login
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (editForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        newErrors.email = t('validation.email_invalid', 'Email inválido');
      }
    }

    // Password validation (only if provided)
    if (editForm.password) {
      if (editForm.password.length < 8) {
        newErrors.password = t('validation.password_min_length', 'Mínimo 8 caracteres');
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(editForm.password)) {
        newErrors.password = t('validation.password_requirements', 'Debe contener mayúscula, minúscula, número y símbolo');
      }
    }

    // Names validation
    if (!editForm.first_name.trim()) {
      newErrors.first_name = t('validation.first_name_required', 'Nombre requerido');
    }
    if (!editForm.last_name.trim()) {
      newErrors.last_name = t('validation.last_name_required', 'Apellido requerido');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({});
    
    try {
      const authService = AuthServiceFactory.getInstance();
      
      // Check authentication before making request
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Validate session and get fresh token
      const isValidSession = await authService.validateSession();
      if (!isValidSession) {
        navigate('/login');
        return;
      }
      
      const token = sessionStorage.getItem('naari_token');
      console.log('Token being used:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.error('No token found');
        navigate('/login');
        return;
      }
      
      // Only send fields that have values and are allowed for the user's role
      const updateData = {};
      if (editForm.first_name.trim()) updateData.first_name = editForm.first_name.trim();
      if (editForm.last_name.trim()) updateData.last_name = editForm.last_name.trim();
      
      // Only admins can update email
      if (editForm.email.trim() && isAdmin()) {
        updateData.email = editForm.email.trim();
      } else if (editForm.email.trim() && !isAdmin()) {
        // Show error if non-admin tries to update email
        setErrors({ general: t('validation.email_admin_only', 'Solo los administradores pueden modificar el email') });
        setSaving(false);
        return;
      }
      
      if (editForm.password) updateData.password = editForm.password;

      console.log('PUT request data:', updateData);
      console.log('PUT request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      const response = await fetch(`${API_CONFIG.API_BASE}${API_ENDPOINTS.USERS.ME}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        console.log('Response not OK:', response.status, response.statusText);
        
        if (response.status === 401) {
          // Token expired or invalid, show error and stay on page
          setErrors({ general: 'Sesión expirada. Por favor, inicia sesión nuevamente.' });
          setSaving(false);
          return;
        }
        
        const error = await response.json().catch(() => ({ error: 'Error updating profile' }));
        throw new Error(error.error || 'Error updating profile');
      }

      const updatedProfile = await response.json();
      console.log('Profile updated:', updatedProfile);
      
      // Handle different response structures
      const profileData = updatedProfile.user || updatedProfile.data || updatedProfile;
      
      setProfile(profileData);
      setEditingFields({});
      setEditForm(prev => ({ ...prev, password: '' })); // Clear password field
      setErrors({});
      
      // Refresh the session to update the user data in the auth service
      await authService.validateSession();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldDoubleClick = (fieldName) => {
    // Prevent email editing for non-admin users
    if (fieldName === 'email' && !isAdmin()) {
      setErrors(prev => ({
        ...prev,
        email: t('validation.email_admin_only', 'Solo los administradores pueden modificar el email')
      }));
      // Clear error after 3 seconds
      setTimeout(() => {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }, 3000);
      return;
    }

    setEditingFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleFieldBlur = (fieldName, event) => {
    // Si es el campo password y se está haciendo click en el botón toggle, no cerrar la edición
    if (fieldName === 'password' && event?.relatedTarget?.classList?.contains('password-toggle')) {
      return;
    }
    
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  const handleFieldKeyPress = (e, fieldName) => {
    if (e.key === 'Enter') {
      handleFieldBlur(fieldName, e);
      if (hasChanges()) {
        handleSave();
      }
    } else if (e.key === 'Escape') {
      // Reset field to original value
      setEditForm(prev => ({
        ...prev,
        [fieldName]: fieldName === 'password' ? '' : (profile?.[fieldName] || profile?.[fieldName.replace('_', '')] || '')
      }));
      handleFieldBlur(fieldName, e);
    }
  };

  const hasChanges = () => {
    const nameChanged = editForm.first_name !== (profile?.first_name || profile?.firstName || '');
    const lastNameChanged = editForm.last_name !== (profile?.last_name || profile?.lastName || '');
    const passwordChanged = editForm.password !== '';
    
    // Only check email changes for admins
    const emailChanged = isAdmin() && editForm.email !== (profile?.email || '');
    
    return nameChanged || lastNameChanged || emailChanged || passwordChanged;
  };

  const handleCancel = () => {
    setEditingFields({
      first_name: false,
      last_name: false,
      email: false,
      password: false
    });
    setEditForm({
      first_name: profile?.first_name || profile?.firstName || '',
      last_name: profile?.last_name || profile?.lastName || '',
      email: profile?.email || '',
      password: ''
    });
    setErrors({});
  };

  const profileContent = () => {
    if (loading) {
      return (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('common.loading', 'Cargando...')}</p>
        </div>
      );
    }

    return (
      <>
        <div className="profile-header">
          <div className="profile-avatar">
            <UserIcon />
          </div>
          <div className="profile-header-info">
            <h1>{
              (profile?.first_name || profile?.firstName) && (profile?.last_name || profile?.lastName)
                ? `${profile.first_name || profile.firstName} ${profile.last_name || profile.lastName}` 
                : profile?.full_name || profile?.email || t('profile.title', 'Mi Perfil')
            }</h1>
            <p className="profile-role">{profile?.role || '-'}</p>
          </div>
          <div className="profile-header-actions">
            {hasChanges() && (
              <div className="profile-save-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary btn-sm"
                  disabled={saving}
                >
                  {t('common.cancel', 'Cancelar')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="btn-spinner"></div>
                      {t('common.saving', 'Guardando...')}
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      {t('common.save', 'Guardar')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="profile-form">
            <div className="form-section">
              <h2>{t('profile.personal_info', 'Información Personal')}</h2>
              
              <div className="form-grid">
                <div className="form-field">
                  <label>{t('profile.first_name', 'Nombre')}</label>
                  <div className="form-field-content">
                    {editingFields.first_name ? (
                      <div className="input-group">
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={e => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                          onBlur={(e) => handleFieldBlur('first_name', e)}
                          onKeyDown={e => handleFieldKeyPress(e, 'first_name')}
                          className={errors.first_name ? 'form-input error' : 'form-input'}
                          placeholder={t('profile.first_name_placeholder', 'Ingresa tu nombre')}
                          autoFocus
                        />
                        {errors.first_name && <span className="error-text">{errors.first_name}</span>}
                      </div>
                    ) : (
                      <div className="form-value-container">
                        <div className="form-value">
                          {profile?.first_name || profile?.firstName || '-'}
                        </div>
                        <button
                          type="button"
                          className="edit-field-btn"
                          onClick={() => handleFieldDoubleClick('first_name')}
                          title={t('profile.edit_field', 'Editar campo')}
                        >
                          <EditIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label>{t('profile.last_name', 'Apellido')}</label>
                  <div className="form-field-content">
                    {editingFields.last_name ? (
                      <div className="input-group">
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={e => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                          onBlur={(e) => handleFieldBlur('last_name', e)}
                          onKeyDown={e => handleFieldKeyPress(e, 'last_name')}
                          className={errors.last_name ? 'form-input error' : 'form-input'}
                          placeholder={t('profile.last_name_placeholder', 'Ingresa tu apellido')}
                          autoFocus
                        />
                        {errors.last_name && <span className="error-text">{errors.last_name}</span>}
                      </div>
                    ) : (
                      <div className="form-value-container">
                        <div className="form-value">
                          {profile?.last_name || profile?.lastName || '-'}
                        </div>
                        <button
                          type="button"
                          className="edit-field-btn"
                          onClick={() => handleFieldDoubleClick('last_name')}
                          title={t('profile.edit_field', 'Editar campo')}
                        >
                          <EditIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label>
                  {t('profile.email', 'Correo electrónico')}
                  {!isAdmin() && (
                    <span className="field-restriction">
                      ({t('profile.admin_only', 'Solo Admin')})
                    </span>
                  )}
                </label>
                <div className="form-field-content">
                  {editingFields.email ? (
                    <div className="input-group">
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        onBlur={(e) => handleFieldBlur('email', e)}
                        onKeyDown={e => handleFieldKeyPress(e, 'email')}
                        className={errors.email ? 'form-input error' : 'form-input'}
                        placeholder={t('profile.email_placeholder', 'correo@ejemplo.com')}
                        autoFocus
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                  ) : (
                    <div className="form-value-container">
                      <div className={`form-value ${!isAdmin() ? 'disabled' : ''}`}>
                        {profile?.email || '-'}
                      </div>
                      {isAdmin() && (
                        <button
                          type="button"
                          className="edit-field-btn"
                          onClick={() => handleFieldDoubleClick('email')}
                          title={t('profile.edit_field', 'Editar campo')}
                        >
                          <EditIcon />
                        </button>
                      )}
                      {!isAdmin() && (
                        <span className="field-disabled-icon" title={t('profile.admin_only_field', 'Solo los administradores pueden editar este campo')}>
                          <LockIcon />
                        </span>
                      )}
                    </div>
                  )}
                  {errors.email && !editingFields.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label>{t('profile.password', 'Contraseña')}</label>
                <div className="form-field-content">
                  {editingFields.password ? (
                    <div className="input-group">
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={editForm.password}
                          onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                          onBlur={(e) => handleFieldBlur('password', e)}
                          onKeyDown={e => handleFieldKeyPress(e, 'password')}
                          className={errors.password ? 'form-input error' : 'form-input'}
                          placeholder={t('profile.password_placeholder', 'Nueva contraseña')}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>
                  ) : (
                    <div className="form-value-container">
                      <div className="form-value password-field">
                        {editForm.password ? '••••••••' : t('profile.password_not_set', 'Clic para cambiar contraseña')}
                      </div>
                      <button
                        type="button"
                        className="edit-field-btn"
                        onClick={() => handleFieldDoubleClick('password')}
                        title={t('profile.edit_field', 'Editar campo')}
                      >
                        <EditIcon />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="profile-page-content">
        {profileContent()}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;