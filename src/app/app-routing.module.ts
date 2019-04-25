import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgxAnalyticsModule } from 'ngx-analytics';
import { NgxAnalyticsGoogleAnalytics } from 'ngx-analytics/ga';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home/12/105999/he',
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
  imports: [
    RouterModule.forRoot(routes , {onSameUrlNavigation: `reload`}),
    NgxAnalyticsModule.forRoot([NgxAnalyticsGoogleAnalytics]),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
