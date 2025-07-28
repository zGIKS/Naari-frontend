export class Credentials {
  constructor(email, password) {
    this.validateEmail(email);
    this.validatePassword(password);
    
    this.email = email;
    this.password = password;
  }

  validateEmail(email) {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }
  }

  validatePassword(password) {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }

  toAuthPayload() {
    return {
      email: this.email,
      password: this.password
    };
  }
}