export class LoginStrategy {
  async execute() {
    throw new Error('execute method must be implemented');
  }
}

export class SingleSessionLoginStrategy extends LoginStrategy {
  async execute(credentials, authRepository, sessionManager) {
    // Verificar si ya hay una sesión activa
    if (sessionManager.hasActiveSession()) {
      throw new Error('ACTIVE_SESSION_EXISTS');
    }

    try {
      // Intentar autenticar
      const user = await authRepository.authenticate(credentials);
      
      // Crear nueva sesión única
      sessionManager.createSession(user, user.accessToken);
      
      return { success: true, user, error: null };
    } catch (error) {
      if (error.message === 'SESSION_CONFLICT') {
        throw new Error('ANOTHER_SESSION_ACTIVE');
      }
      throw error;
    }
  }
}

export class ForceLoginStrategy extends LoginStrategy {
  async execute(credentials, authRepository, sessionManager) {
    // Invalidar sesión actual si existe
    if (sessionManager.hasActiveSession()) {
      sessionManager.invalidateCurrentSession();
    }

    // Autenticar y crear nueva sesión
    const user = await authRepository.authenticate(credentials);
    sessionManager.createSession(user, user.accessToken);
    
    return { success: true, user, error: null };
  }
}