import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'home/details/:symbol', loadChildren: './pages/coin-details/coin-details.module#CoinDetailsPageModule' },
  { path: 'MarketCap', loadChildren: './pages/market-cap/market-cap.module#MarketCapPageModule' },
  { path: 'watchlist-configuration', loadChildren: './pages/watchlist-configuration/watchlist-configuration.module#WatchlistConfigurationPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
