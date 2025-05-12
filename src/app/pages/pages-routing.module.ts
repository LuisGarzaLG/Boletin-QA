import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PagesComponent } from './pages.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { DeleteComponent } from './delete/delete.component';
import { DownloadComponent } from './download/download.component';


const routes: Routes =[
  {
      path: '',
      component: PagesComponent,
      children:[
          {
              path: 'home',
              component: HomeComponent,
              loadChildren: () => import ('./home/home.module').then(m => m.HomeModule)
          },
          {
            path: 'add',
            component: AddComponent,
            loadChildren:() => import ('./add/add.module').then(m => m.AddModule)
          },
          {
            path: 'edit',
            component: EditComponent,
            loadChildren:()=> import('./edit/edit.module').then(m=> m.EditModule)
          },
          {
            path: 'delete',
            component: DeleteComponent,
            loadChildren:() => import ('./delete/delete.module').then(m => m.DeleteModule)
          },
          {
            path: 'download',
            component: DownloadComponent,
            loadChildren:()=> import ('./download/download.module').then(m=>m.DownloadModule)
          },
          {
              path: '',
              redirectTo: 'home',
              pathMatch:'full',
          },
      ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule{}
