import { NgModule } from "@angular/core";
import { Routes, RouterModule, ExtraOptions } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/home/12/105999",
    pathMatch: "full"
  },
  {
    path: "home/:venueId/:kioskId",
    loadChildren: "./views/home/home.module#HomeModule"
  },
  {
    path: "search/:venueId",
    loadChildren: "./views/search/search.module#SearchModule"
  },
  {
    path: "category/:categoryId/:venueId",
    loadChildren: "./views/category/category.module#CategoryModule"
  },
  {
    path: "direction/:venueId/:kioskId/:poiId",
    loadChildren: "./views/direction/direction.module#DirectionModule"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
