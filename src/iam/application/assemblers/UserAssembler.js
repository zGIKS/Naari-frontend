import { User } from '../../domain/entities/User.js';

export class UserAssembler {
  static fromApiResponse(apiResponse) {
    return new User(
      apiResponse.id || apiResponse.userId,
      apiResponse.email,
      apiResponse.name || apiResponse.fullName,
      apiResponse.token || apiResponse.accessToken
    );
  }

  static toViewModel(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.getDisplayName(),
      isAuthenticated: user.isAuthenticated()
    };
  }
}