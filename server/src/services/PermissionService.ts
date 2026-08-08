import { hasPermission, RoomAction, UserRole } from '@watch-party/shared';
import { UnauthorizedError } from '../errors';

export class PermissionService {
  private static instance: PermissionService;

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  public checkPermission(role: UserRole, action: RoomAction): void {
    if (!hasPermission(role, action)) {
      throw new UnauthorizedError(`Role '${role}' is not authorized to perform action '${action}'`);
    }
  }

  public isAuthorized(role: UserRole, action: RoomAction): boolean {
    return hasPermission(role, action);
  }
}
