import { Injectable } from "@angular/core";
import { UserDetails } from "../../models/security-models";

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  private CurrentUser!: UserDetails;

  public saveToken(tokenDto: any): void {
    this.RemoveUserToken();
    window.sessionStorage.setItem('token', tokenDto.token);
    const tokenValue = tokenDto.token.split('.')[1];
    const decodedToken = JSON.parse(atob(tokenValue));
    const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    // Asegurarse de que los roles sean un array
    this.CurrentUser = {
      name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      givenName: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
      email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      Roles: Array.isArray(roles) ? roles : [roles], // Si solo hay un rol, conviértelo en un array
      pucture: tokenDto.photo ? 'data:image/png;base64,' + tokenDto.photo : null,
    };

    window.sessionStorage.setItem('currentUser', JSON.stringify(this.CurrentUser));
  }

  public RemoveUserToken() {
    window.sessionStorage.removeItem('token');
    window.sessionStorage.removeItem('currentUser');
    window.sessionStorage.removeItem('tokenExpirationTime');
  }

  public getUserRoles(): string[] {
    return this.CurrentUser?.Roles || [];
  }
}
