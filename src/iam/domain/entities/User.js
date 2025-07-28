export class User {
  constructor(id, email, name, accessToken) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.accessToken = accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  getDisplayName() {
    return this.name || this.email;
  }
}