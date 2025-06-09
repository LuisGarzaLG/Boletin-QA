import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './providers/services/security/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { qualityrequestsprovaider } from './providers/services/quality request/qualityBrequestsprovaider';
import Swal from 'sweetalert2';
import { NbMenuService } from '@nebular/theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'RRHH';
  isAuthenticated = false;
  private authSubscription!: Subscription;

  menuItems: any[] = [];
  private userRoles: string[] = [];
  private rolesSubscription: Subscription = new Subscription();
  currentUserName: string = ''; 

  isSidebarExpanded: boolean = false;

  logo = 'https://eu.landisgyr.com/hs-fs/hubfs/logo_landis_gyr_white.png?width=161&name=logo_landis_gyr_white.png';

  constructor (private authService: AuthService, private router: Router, private provider: qualityrequestsprovaider,private menuService: NbMenuService) {}

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
            /*{
              title: 'Entrenamientos',
              icon: 'checkmark-square-outline',
              link: '/pages/training',
              roles:['BulletinQA']
            }*/
          ]
        },
        {
          title: 'Descargar / Imprimir PDF',
          icon: 'printer-outline',
          link: '/pages/download'
        },
      ];
      this.menuItems = this.filterMenuItemsByRoles(this.menuItems);

      this.menuService.onItemClick().subscribe(() => {
    this.isSidebarExpanded = false;
  });
      
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

onUserIconClick() {
  if (this.authService.IsLoggedIn()) {
    // Si hay sesión activa, preguntar antes de cerrar
    this.confirmLogout();
  } else {
    // Si no hay sesión, redirigir al login
    this.router.navigate(['auth/login']);
  }
}

  confirmLogout(): void {
    Swal.fire({
      title: '¿Deseas cerrar sesión?',
      text: 'Tu sesión actual se cerrará.',
      icon: 'warning',
      showCancelButton: true,
      background: '#333',
      color: '#fff',
      customClass: {
        title: 'custom-toast-title',
        popup: 'swal2-borderless'},
      confirmButtonColor: '#4370fc',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        this.authService.logout();
        this.currentUserName = '';
        this.isAuthenticated = false;
        this.isSidebarExpanded = false;

        this.router.navigate(['/pages/home']);
      }
    });
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
