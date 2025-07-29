export class JWTUtils {
  /**
   * Decodifica el payload de un JWT sin verificar la firma
   * @param {string} token - El JWT token
   * @returns {object} - El payload decodificado
   */
  static decodeToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token');
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      
      return decoded;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Extrae los roles del JWT
   * @param {string} token - El JWT token
   * @returns {array} - Array de roles
   */
  static extractRoles(token) {
    const decoded = this.decodeToken(token);
    return decoded?.roles || [];
  }

  /**
   * Extrae el user_id del JWT
   * @param {string} token - El JWT token
   * @returns {string} - El user_id
   */
  static extractUserId(token) {
    const decoded = this.decodeToken(token);
    return decoded?.user_id || decoded?.sub;
  }

  /**
   * Verifica si el token ha expirado
   * @param {string} token - El JWT token
   * @returns {boolean} - true si ha expirado
   */
  static isTokenExpired(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  /**
   * Obtiene información completa del token
   * @param {string} token - El JWT token
   * @returns {object} - Información del token
   */
  static getTokenInfo(token) {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return null;
    }

    return {
      userId: decoded.user_id || decoded.sub,
      sessionId: decoded.session_id,
      roles: decoded.roles || [],
      exp: decoded.exp,
      iat: decoded.iat,
      isExpired: this.isTokenExpired(token)
    };
  }
}