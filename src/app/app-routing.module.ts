import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home/:venueId/:kioskId/:langId',
    pathMatch: 'full'
  },
  {
    path: 'home/:venueId/:kioskId/:langId',
    loadChildren: './views/home/home.module#HomeModule'
  },
  {
    path: 'search/:venueId/:langId',
    loadChildren: './views/search/search.module#SearchModule'
  },
  {
    path: 'category/:categoryId/:venueId/:langId',
    loadChildren: './views/category/category.module#CategoryModule',
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'direction/:venueId/:kioskId/:poiId/:langId',
    loadChildren: './views/direction/direction.module#DirectionModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes , {onSameUrlNavigation: `reload`})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
