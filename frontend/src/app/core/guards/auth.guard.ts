import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      const roles = route.data['roles'] as string[] | undefined;
      if (roles?.length && !this.authService.hasRole(...roles)) {
        const user = this.authService.getCurrentUserSnapshot();
        return this.router.createUrlTree([user?.role === 'AGENT' ? '/sales/new' : '/dashboard']);
      }
      return true;
    }

    return this.router.createUrlTree(['/login']);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.canActivate(route);
  }
}
