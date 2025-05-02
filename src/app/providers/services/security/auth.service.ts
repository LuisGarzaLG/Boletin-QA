import { HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseProvider } from "../base.provider"; 
import { BehaviorSubject } from "rxjs";
import Swal from 'sweetalert2';
import { ApiService } from "../api.provider"; 
import { ToastrProvider } from "../../toastr/toastr-service";
import { TokenStorageService } from "./token-storage.service"; 

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseProvider {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isTokenPresent());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private rolesSubject = new BehaviorSubject<string[]>(this.loadRolesFromSession());
  public roles$ = this.rolesSubject.asObservable();

  private endPoint = 'security';//cambiar si quieres usar el login de "rh security/rh-log-i"
  private userendPoint = 'directory/findspecificuser';

  constructor(
    baseService: ApiService,
    toastService: ToastrProvider,
    tokenStorageService: TokenStorageService
  ) {
    super(baseService, toastService, tokenStorageService);
  }

  private isTokenPresent(): boolean {
    return !!sessionStorage.getItem('userToken');
  }
  private loadRolesFromSession(): string[] {
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    return roles;
  }
  
  public async Login(entity: any): Promise<boolean> {
    return await this.service
      .LoginPost<HttpResponse<any>>(this.endPoint, entity)
      .then(async (response) => {
        if (response.status >= 200 && response.status <= 299) {
          this.tokenStorageService.saveToken(response.body);
          this.isAuthenticatedSubject.next(true);
          await this.GetRoles();
          return true;
        }
        if (response.status >= 400 || response.status <= 499) {
          Swal.fire({
            icon: 'error',
            title: `<div class="text-dark"> ${response.error.detail} </div>`,
            showConfirmButton: false,
            timer: 1500
          });
          return false;
        }

        this.toastProvider.Danger('Error has been thrown');
        return false;
      });
  }

  public async GetRoles(): Promise<void> {
    const rolesFromToken = this.tokenStorageService.getUserRoles();

    let primaryRoles: string[] = JSON.parse(sessionStorage.getItem('roles') || '[]');

    // Agregar roles solo si no están ya presentes
    if (rolesFromToken.includes("BulletinQA") && !primaryRoles.includes("BulletinQA")) {
        primaryRoles.push("BulletinQA");
    }
    if (rolesFromToken.includes("BULLETINPROD") && !primaryRoles.includes("BULLETINPROD")) {
      primaryRoles.push("BULLETINPROD");
  }
    sessionStorage.setItem('roles', JSON.stringify(primaryRoles));
    this.rolesSubject.next(primaryRoles);
}

private updateSessionRoles(roles: string[]): void {
  sessionStorage.setItem('roles', JSON.stringify(roles));
  this.rolesSubject.next(roles);
}


  public async GetNewToken() {
    return await this.service
      .RefreshToken<HttpResponse<any>>(this.endPoint)
      .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
          this.tokenStorageService.saveToken(response.body);
          return true;
        }

        if (response.status >= 400 || response.status <= 499) {
          Swal.fire({
            icon: 'error',
            title: `<div class="text-dark"> ${response.error.detail} </div>`,
            showConfirmButton: false,
            timer: 1500
          });
          return false;
        }

        this.toastProvider.Danger('Error ha sido lanzado');
        return false;
      });
  }

  IsLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  public async GetNormalizedUserName(): Promise<boolean> {
    const userName = sessionStorage.getItem('userName');

    if (!userName) {
      Swal.fire({
        icon: 'error',
        title: `<div class="text-dark"> No se encontró el nombre de usuario en sessionStorage. </div>`,
        showConfirmButton: false,
        timer: 1500
      });
      return false;
    }

    const url = `${this.userendPoint}/${encodeURIComponent(userName)}`;

    return await this.service
      .RefreshToken<HttpResponse<any>>(url)
      .then((response) => {
        if (response.status >= 200 && response.status <= 299 && response.body) {
          const normalizedUserName = response.body.normalizedUserName;

          if (normalizedUserName) {
            const parts = normalizedUserName.split(',').map((part: string) => part.trim());
            const processedName = parts.length === 2 ? `${parts[1].toUpperCase()} ${parts[0].toUpperCase()}` : normalizedUserName;
            sessionStorage.setItem('normalizedUserName', processedName);
            return true;
          } else {
            Swal.fire({
              icon: 'error',
              title: `<div class="text-dark"> No se pudo obtener el normalizedUserName. </div>`,
              showConfirmButton: false,
              timer: 1500
            });
            return false;
          }
        }

        if (response.status >= 400 || response.status <= 499) {
          Swal.fire({
            icon: 'error',
            title: `<div class="text-dark"> ${response.error.detail} </div>`,
            showConfirmButton: false,
            timer: 1500
          });
          return false;
        }

        this.toastProvider.Danger('Error ha sido lanzado');
        return false;
      })
      .catch(error => {
        console.error('Error al obtener el nombre de usuario normalizado:', error);
        return false;
      });
  }

  getCurrentUserName(): string {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    return user?.name || ' ';
  }

  logout(): void {
    sessionStorage.clear();
    this.isAuthenticatedSubject.next(false);
    this.rolesSubject.next([]);
  }

  public getRolesObservable() {
    return this.rolesSubject.asObservable();
  }

  public updateRoles(roles: string[]): void {
    sessionStorage.setItem('roles', JSON.stringify(roles));
    this.rolesSubject.next(roles);
  }

  public hasRole(role: string): boolean {
    return this.rolesSubject.value.includes(role);
  }

  public hasRoles(requiredRoles: string[]): boolean {
    return requiredRoles.some(role => this.rolesSubject.value.includes(role));
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  public async getEmailByUsername(userName: string): Promise<string | null> {
    if (!userName) {
      Swal.fire({
        icon: 'error',
        title: `<div class="text-dark"> No se proporcionó el username para buscar el correo. </div>`,
        showConfirmButton: false,
        timer: 1500
      });
      return null;
    }
  
    const url = `${this.userendPoint}/${encodeURIComponent(userName)}`;
  
    return await this.service
      .RefreshToken<HttpResponse<any>>(url)
      .then((response) => {
        if (response.status >= 200 && response.status <= 299 && response.body) {
          const email = response.body.email; 
  
          if (email) {
            return email; 
          } else {
            Swal.fire({
              icon: 'error',
              title: `<div class="text-dark"> No se encontró el correo para el usuario ${userName}. </div>`,
              showConfirmButton: false,
              timer: 1500
            });
            return null;
          }
        }
  
        if (response.status >= 400 || response.status <= 499) {
          Swal.fire({
            icon: 'error',
            title: `<div class="text-dark"> ${response.error.detail} </div>`,
            showConfirmButton: false,
            timer: 1500
          });
          return null;
        }
  
        this.toastProvider.Danger('Error al intentar obtener el correo.');
        return null;
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: `<div class="text-dark"> Error al intentar obtener el correo del usuario ${userName}. </div>`,
          showConfirmButton: false,
          timer: 1500
        });
        return null;
      });
  }
}