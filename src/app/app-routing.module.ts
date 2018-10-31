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
    path: "search",
    loadChildren: "./views/search/search.module#SearchModule"
  },
  {
    path: "category/:categoryId",
    loadChildren: "./views/category/category.module#CategoryModule"
  },
  {
    path: "direction/:kioskId/:poiId",
    loadChildren: "./views/direction/direction.module#DirectionModule"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
