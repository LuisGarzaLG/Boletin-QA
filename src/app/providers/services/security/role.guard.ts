import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate } from "@angular/router";
import { Observable } from "rxjs";
import { ToastrProvider } from "../../toastr/toastr-service";
import { AuthService } from "../../../providers/services/security/auth.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private toastrProvider: ToastrProvider
  ) {}

  canActivate(next: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const requiredRoles = next.data.roles;

    return this.authService.roles$.pipe(
      map(userRoles => {
        if (!userRoles || userRoles.length === 0) {
          this.showAccessDeniedMessage();
          return false;
        }

        const hasRequiredRole = this.hasMatchingRole(userRoles, requiredRoles);
        if (!hasRequiredRole) {
          this.showAccessDeniedMessage();
        }
        return hasRequiredRole;
      })
    );
  }

  private hasMatchingRole(userRoles: string[], requiredRoles: string[]): boolean {
    //console.log("User Roles:", userRoles);  // Imprimir los roles del usuario
    //console.log("Required Roles:", requiredRoles);  // Imprimir los roles requeridos
    const result = userRoles.some(userRole => requiredRoles.includes(userRole));
    //console.log("Matching Roles:", result);  // Ver si hay alguna coincidencia
    return result;
  }

  private showAccessDeniedMessage(): void {
    this.toastrProvider.Danger("You don't have access, please contact Administrator");
  }

  public CanAccess(rolesToValidate: string[]): Observable<boolean> {
    return this.authService.roles$.pipe(
      map(userRoles => {
        const filteredRoles = userRoles.filter(role => role !== "Administrator");
        return this.hasMatchingRole(filteredRoles, rolesToValidate);
      })
    );
  }
}
