import { AuthRepository } from '../../domain/repositories/AuthRepository.js';
import { UserAssembler } from '../../application/assemblers/UserAssembler.js';
import { ApiRouter } from '../../../shared/services/ApiRouter.js';

export class ApiAuthRepository extends AuthRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async authenticate(credentials) {
    try {
      const response = await this.apiClient.post(
        ApiRouter.AUTH.LOGIN, 
        credentials.toAuthPayload()
      );
      
      const user = UserAssembler.fromApiResponse(response);
      
      if (user.accessToken) {
        localStorage.setItem('naari_auth_token', user.accessToken);
        this.apiClient.setAuthToken(user.accessToken);
      }
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Authentication failed');
    }
  }
}