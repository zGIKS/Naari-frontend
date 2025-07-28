import { Credentials } from '../../domain/value-objects/Credentials.js';

export class LoginCommand {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async execute(email, password) {
    try {
      const credentials = new Credentials(email, password);
      const result = await this.sessionManager.createSession(credentials.toAuthPayload());
      return result;
    } catch (error) {
      return { success: false, user: null, error: error.message };
    }
  }
}