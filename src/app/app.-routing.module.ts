import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbAuthComponent, NbLogoutComponent, NbRegisterComponent, NbRequestPasswordComponent, NbResetPasswordComponent } from '@nebular/auth';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {path:'', redirectTo: 'pages', pathMatch: 'full'},
  {
    path:'auth',
    component: NbAuthComponent,
    children: [
      { path: '', component: LoginComponent},
      { path: 'login', component: LoginComponent},
      { path: 'register', component: NbRegisterComponent },
      { path: 'logout', component: NbLogoutComponent },
      { path: 'request-password', component: NbRequestPasswordComponent },
      { path: 'reset-password', component: NbResetPasswordComponent },
    ],
  },
  {
    path: 'pages',
    loadChildren: ()=> import('./pages/pages.module').then(m=> m.PagesModule),
  },
  { path: '**',  redirectTo: 'pages', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
