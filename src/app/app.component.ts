import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HomePage } from './home/home.page';
import { MarketCapPage } from './pages/market-cap/market-cap.page';
//import { HistoryPage } from '../pages/history/history';
//import { SettingsPage } from '../pages/settings/settings';
//import { DonatePage } from '../pages/donate/donate';
import { DatabaseService } from './services/database.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  @ViewChild(Nav) nav: Nav;
  //rootPage:any = HomePage;

  pages: Array<{title: string, component: any}>;
  portfolioName = "";

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public sql : DatabaseService, private storage : Storage) {
    this.initializeApp();
    this.updatePortfolioName();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Market Portfolio', component: HomePage },
      { title: 'Market Cap', component: MarketCapPage },
    //  { title: 'History', component: HistoryPage },
    //  { title: 'Settings', component: SettingsPage },
    //  { title: 'Donate', component: DonatePage },
    ];
    
    sql.openDatabase();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#000');
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  updatePortfolioName() {
    this.storage.get('portfolioName').then((val) => {
        if(!val)
        {
          this.storage.set('portfolioName', 'Your Portfolio');
          $("#menuName").text('Your Portfolio');
        }
        else
        {
          this.portfolioName = val;
          $("#menuName").text(val);
        }
    });
  }

}
