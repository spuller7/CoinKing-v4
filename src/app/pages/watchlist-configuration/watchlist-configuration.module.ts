import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { WatchlistConfigurationPage } from './watchlist-configuration.page';

const routes: Routes = [
  {
    path: '',
    component: WatchlistConfigurationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [WatchlistConfigurationPage]
})
export class WatchlistConfigurationPageModule {}
