import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth.service"; 


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private service: AuthService, private route: Router) {}

  canActivate(): boolean {
    if (this.service.IsLoggedIn()) {
      console.log('Usuario autenticado, acceso permitido');
      return true;
    } else {
      console.log('Usuario NO autenticado, redirigiendo al login');
      this.route.navigate(['/auth/login']);
      return false;
    }
  }
  
}
