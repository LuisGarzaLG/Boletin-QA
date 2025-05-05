import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './providers/services/security/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { qualityrequestsprovaider } from './providers/services/quality request/qualityBrequestsprovaider';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'RRHH';
  isLoggedIn: boolean =  false;
  isAuthenticated = false;
  GownChangeCount: number = 0;
  private authSubscription!: Subscription;

  menuItems: any[] = [];
  private userRoles: string[] = [];
  private rolesSubscription: Subscription = new Subscription();
  currentUserName: string = ''; 

  isSidebarExpanded: boolean = false;

  // Agregar logo
  logo = 'https://eu.landisgyr.com/hs-fs/hubfs/logo_landis_gyr_white.png?width=161&name=logo_landis_gyr_white.png';

  constructor (private authService: AuthService, private router: Router, private provider: qualityrequestsprovaider) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.IsLoggedIn();

    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (authStatus) => {
        this.isAuthenticated = authStatus;
      }
    );
    

    this.rolesSubscription = this.authService.getRolesObservable().subscribe((roles: string[]) => {
      this.userRoles = roles;

      this.currentUserName = this.authService.getCurrentUserName();

      this.menuItems = [
        {
          title: 'Inicio',
          icon: 'home-outline',
          link: '/pages/home'
        },
        
        {
          title: 'Gestión',
          icon: 'people-outline',
          roles:['BulletinQA','BULLETINPROD'],
          children:[
            {
              title: 'Agregar',
              icon: 'file-add-outline',
              link: '/pages/add',
              roles:['BulletinQA','BULLETINPROD']
            },
            {
              title: 'Editar',
              icon: 'file-text-outline',
              link: '/pages/edit',
              roles:['BulletinQA']
            },
            {
              title: 'Eliminar',
              icon: 'file-remove-outline',
              link: '/pages/delete',
              roles:['BulletinQA']
            },
          ]
        },
        {
          title: 'Descargar / Imprimir PDF',
          icon: 'printer-outline',
          link: '/pages/download'
        },
      ];
      this.menuItems = this.filterMenuItemsByRoles(this.menuItems);
    });

    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    this.authService.updateRoles(roles);

    
  }

  filterMenuItemsByRoles(items: any[]): any[] {
    return items.filter(item => {
      if (!item.roles) {
        return true;
      }
      return this.userHasRole(item.roles);
    }).map(item => {
      if (item.children) {
        item.children = this.filterMenuItemsByRoles(item.children);
      }
      return item;
    });
  }

  userHasRole(allowedRoles: string[]): boolean {
    return this.userRoles.some(role => allowedRoles.includes(role));
  }

  navigateToLogin() {
    this.logout();
    this.router.navigate(['auth/login']); 
  }

  logout(): void {
    sessionStorage.clear();
    this.authService.logout();
    this.currentUserName = '';
    this.isLoggedIn = false;
    this.isAuthenticated = false;
    this.isSidebarExpanded = false;
  }

  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  ngOnDestroy(): void {
    this.rolesSubscription.unsubscribe();
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  
}
