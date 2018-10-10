import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Home'
    },
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home/:kioskId',
        loadChildren: './views/home/home.module#HomeModule'
      },
      {
        path: 'search',
        loadChildren: './views/search/search.module#SearchModule'
      },
      {
        path: 'category/:categoryId',
        loadChildren: './views/category/category.module#CategoryModule'
      },
      {
        path: 'direction/:kioskId/:poiId',
        loadChildren: './views/direction/direction.module#DirectionModule'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
