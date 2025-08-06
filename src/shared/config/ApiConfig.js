export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  API_VERSION: 'v1',
  
  get API_BASE() {
    return `${this.BASE_URL}/api/${this.API_VERSION}`;
  }
};