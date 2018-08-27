//Modules
import { Component } from '@angular/core';
import { NavController, ToastController, PopoverController, AlertController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Chart } from 'chart.js';
import { Network } from '@ionic-native/network';
import { forkJoin } from 'rxjs';
import * as $ from 'jquery';
//services
import { DataService } from '../services/data.service';
import { ListService } from '../services/list.service';
import { DatabaseService } from '../services/database.service';
//components
import { ListOptionsComponent } from '../list-options/list-options.component';
//pages
//import { WatchlistConfigurationPage } from '../watchlist-configuration/watchlist-configuration';
//import { CoinDetailsPage } from '../coin-details/coin-details';
//import { AddCoinPage } from '../add-coin/add-coin';
//import { OnboardingPage } from '../onboarding/onboarding';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  portfolioData = [];
	objectKeys = Object.keys;
	coins: Object;
  currentChart: any;
	selectedCoins = [];
  storedCoins : any;
  popover : Component;
  coinsOwned = [];
  startingPrice = 0;
  currentAccountValue = 0;
  startup = false;
  investedAmount = 0;
  noData = false;
  currency = "";
  watchlistCharts = [];
  red = "";
  green = "";
  connectionToast = null;
  watchlistPopup: any;

	constructor(private toast: ToastController, private alertCtrl: AlertController, /*private network: Network,*/ public loading: LoadingController, private _transactions: DatabaseService, public navCtrl: NavController, private _data: DataService, private storage: Storage, public popoverCtrl: PopoverController, public _listData : ListService) {
		this.storage.remove('storedCoins');
    this.startup = true;

    this.red = $('#red').css("background-color");
    this.red = $('#green').css("background-color");
    
    this.storage.get('usedAppBefore').then((val) => {
        if(!val)
        {
          //this.navCtrl.push(OnboardingPage);
        }
    });
	}

  ionViewWillEnter() {
    /*this.network.onConnect().subscribe(data => {
        this.connectionToast.dismiss();
    });
    this.network.onDisconnect().subscribe(data => {
      this.displayNetworkUpdate(data.type);
    });*/
    this.loadData();
  }

  displayNetworkUpdate(connectionState: string){
    this.connectionToast = this.toast.create({
      position: 'top',
      message: 'Please Connect to an Internet Connection',
    });

    this.connectionToast.present();
  }
  
  async presentPopover(myEvent) {
    const popover = await this.popoverCtrl.create({
      component: ListOptionsComponent,
      ev: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    this.watchlistPopup = popover;
    return await popover.present();
  }

  async loadData()
  {
    this.noData = false;
    let loader = await this.loading.create({
			content: 'Loading..',
			spinner: 'crescent'
		});

    if(this.currentChart)
    {
      this.currentChart.destroy();
    }
    if(this.portfolioData)
    {
      this.portfolioData = [];
    }

    loader.present().then(() => {

      this.storage.get('currency').then((val) => {
        if(!val)
        {
          this.storage.set('currency', 'USD');
        }
        else
        {
          this.currency = val;
        }
      });
      
			this.storage.get('storedCoins').then((val) => {
				if (!val)
        {
          this.generateDefaultCoinList(loader);
        }
        else
        {
          if(val.Coins)
          {
            if(val.Coins.length == 0)
            {
              this.noData = true;
              //loader.dismiss();
            }
            else
            {
              this.loadCoinWatchlistData(val, loader);
            }
          }
          else
          {
            this.loadCoinWatchlistData(val, loader);
          }
				}
			});
		});
  }

  //creates default list when user first enters app without any prior setup
  generateDefaultCoinList(loader)
  {
    this.selectedCoins.push('BTC', 'ETH', 'LTC');
		this.storage.set('selectedCoins', this.selectedCoins);
    var BTCexample = this._data.createCoinObject('Bitcoin', 'BTC', "https://s2.coinmarketcap.com/static/img/coins/16x16/1.png", 1182);
    var ETHexample = this._data.createCoinObject('Ethereum', 'ETH', "https://s2.coinmarketcap.com/static/img/coins/16x16/1027.png", 7605);
    var LTCexample = this._data.createCoinObject('Litecoin', 'LTC', "https://s2.coinmarketcap.com/static/img/coins/16x16/2.png", 3808);
    var PRLexample = this._data.createCoinObject('Oyster', 'PRL', "https://s2.coinmarketcap.com/static/img/coins/16x16/2202.png", 429355);
    var coinObject = { 'Coins' : [BTCexample, ETHexample, LTCexample, PRLexample] };
    this.storage.set('storedCoins', coinObject);
    console.log("[CoinKing] Created default watchlist");
    this.storedCoins = coinObject;
    var localThis = this;
    this.storedCoins.Coins.forEach(function(entry, index)
    {
      localThis._data.getCoin(entry.symbol).subscribe(res => {
        let price = res['RAW']['' + entry.symbol + '']['' + localThis._data.currencySymbol + '']['PRICE'];
        let percentChange = res['RAW']['' + entry.symbol + '']['' + localThis._data.currencySymbol + '']['CHANGEPCT24HOUR'];;
        localThis.storedCoins.Coins[index].price = price;
        localThis.storedCoins.Coins[index].equity = 0;
        localThis.storedCoins.Coins[index].holdings = 0;
        localThis.storedCoins.Coins[index].percent = percentChange;
        localThis.storedCoins.Coins[index].totalGainLoss = 0;
        localThis.storedCoins.Coins[index].totalPercentGainLoss = 0;
        localThis.storedCoins.Coins[index].portfolioChartData = [];
      });
      if(index == localThis.storedCoins.Coins.length - 1)
      {
        localThis.loadCoinWatchlistData(localThis.storedCoins, loader);;
      }
    });

  }

  //get all data for the coins in the user's watchlist
  loadCoinWatchlistData(val, loader)
  {
    let coinsHeld = this._transactions.getOwnedCoinAmount();
    this.coinsOwned = [];
    coinsHeld.then((res) => {
      this.coinsOwned = res;
    });

    let coinInvestmentAmount : any;
    this._transactions.getCoinInvestmentAmount().then((res) => {
      coinInvestmentAmount = res;
    });
    this.storedCoins = val;
    var localThis = this;

    if(this.storedCoins.Coins)
    {
      let storedCoinSymbols = this.storedCoins.Coins.map((a) => (a.symbol));
      let observables = this._data.getMultiCoinData(storedCoinSymbols);

      forkJoin(observables).subscribe(results => {
        localThis.calculateCoinWatchlistData(results, coinInvestmentAmount, loader);
      });
    }
    else
    {
      this.storedCoins["Coins"] = [];
      this.storage.set('storedCoins', this.storedCoins);
      this.noData = true;
      loader.dismiss();
    }

  }

  calculateCoinWatchlistData(data, coinInvestmentAmount, loader)
  {
    this.investedAmount = 0;
    for(var c in coinInvestmentAmount) { this.investedAmount += coinInvestmentAmount[c]; }
    //Individual Coin Watchlist Data
    for(var i = 0; i < this.storedCoins.Coins.length; i++)
    {
      let entry = this.storedCoins.Coins[i];
      //For last price data
      let price = data[i]['RAW']['' + entry.symbol + '']['' + this._data.currencySymbol + '']['PRICE'];
      entry.price = price;
      //For equity data
      if(this.coinsOwned[entry.symbol] != null)
      {
        entry.equity = this.coinsOwned[entry.symbol] * price;
      }
      else
      {
        entry.equity = 0;
      }

      //For holdings Data
      if(this.coinsOwned[entry.symbol] != null)
      {
        entry.holdings = this.coinsOwned[entry.symbol];
      }
      else
      {
        entry.holdings = 0;
      }

      //For Percent Change Data
      let percentChange = data[i]['RAW']['' + entry.symbol + '']['' + this._data.currencySymbol + '']['CHANGEPCT24HOUR'];
      entry.percent = percentChange;
      //For Total gain/loss data
      if(this.coinsOwned[entry.symbol] != null)
      {
        entry.totalGainLoss = coinInvestmentAmount[entry.symbol] + entry.equity;
      }
      else
      {
        entry.totalGainLoss = 0;
      }
                
      //For Total percent gain/loss data
      if(this.coinsOwned[entry.symbol] != null)
      {
        let investment = Math.abs(coinInvestmentAmount[entry.symbol]);
        let diff = entry.equity - investment;
        entry.totalPercentGainLoss = (diff / investment);
      }
      else
      {
        entry.totalPercentGainLoss = 0;
      }
    }
    this.loadPortfolioChartData(loader);
  }

  loadPortfolioChartData(loader)
  {
    let storedCoinSymbols = this.storedCoins.Coins.map(a => a.symbol);
    let localThis = this;
    if(this.storedCoins.Coins.length > 0)
    {
      for(var i = 0; i < this.storedCoins.Coins.length; i++)
      {
        let selectedTimeRange = this._data.getSelectedTimeRange();
        let entry = this.storedCoins.Coins[i];

        if(selectedTimeRange == "hour")
        {
          this.portfolioData['chartDescriptor'] = "past hour";
          $("button").removeClass("selected");
          $(".oneHour").addClass("selected");
          this._data.getChartHour(entry.symbol, true).subscribe((res) => {
            localThis.generateCoinWatchlistGraph(res, entry);
          });
        }
        else if(selectedTimeRange == "week")
        {
          this.portfolioData['chartDescriptor'] = "past week";
          $("button").removeClass("selected");
          $(".oneWeek").addClass("selected");
          this._data.getChartWeek(entry.symbol, true).subscribe((res) => {
            localThis.generateCoinWatchlistGraph(res, entry);
          });
        }
        else if(selectedTimeRange == "month")
        {
          this.portfolioData['chartDescriptor'] = "past 30 days";
          $("button").removeClass("selected");
          $(".oneMonth").addClass("selected");
          this._data.getChartMonth(entry.symbol, true).subscribe((res) => {
            localThis.generateCoinWatchlistGraph(res, entry);
          });
        }
        else if(selectedTimeRange == "three months")
        {
          this.portfolioData['chartDescriptor'] = "past 3 months";
          $("button").removeClass("selected");
          $(".threeMonths").addClass("selected");
          this._data.getChartThreeMonths(entry.symbol, true).subscribe((res) => {
            localThis.generateCoinWatchlistGraph(res, entry);
          });
        }
        else if(selectedTimeRange == "year")
        {
          this.portfolioData['chartDescriptor'] = "past year";
          $("button").removeClass("selected");
          $(".oneYear").addClass("selected");
          this._data.getChartOneYear(entry.symbol, true).subscribe((res) => {
            localThis.generateCoinWatchlistGraph(res, entry);
          });
        }
        else if(selectedTimeRange == "five years")
        {
          this.portfolioData['chartDescriptor'] = "past 5 years";
          $("button").removeClass("selected");
          $(".fiveYears").addClass("selected");
          this._data.getChartFiveYears(entry.symbol, true).subscribe((res) => {
            localThis.generateCoinWatchlistGraph(res, entry);
          });
        }
        else
        {
          this.portfolioData['chartDescriptor'] = "past 24 hours";
          $("button").removeClass("selected");
          $(".oneDay").addClass("selected");
          this._data.getChart(entry.symbol, true).subscribe((res) => {
            localThis.generateCoinWatchlistGraph(res, entry);
          });
        }
        if(i == this.storedCoins.Coins.length - 1)  
        {
          let observables = this._data.getMultiChartData(storedCoinSymbols, selectedTimeRange);
          forkJoin(observables).subscribe(results => {
            this.aggregatePortfolioChartData(results, loader);
          });
        }
      }
    }
    else
    {
      loader.dismiss();
    }
  }

	coinDetails(coin) {
    var path = '/home/details/' + coin;
    this.navCtrl.goForward(path);
    this.clearGraph();
	}

  generateCoinWatchlistGraph(data, entry)
  {
    let coinHistory = data['Data'].map((a) => (a.close));
    let diff = coinHistory[coinHistory.length - 1] - coinHistory[0]; 
    setTimeout(() => {
      let chartColor = "";
      if(this._data.getSelectedTimeRange() == "day")
      {
        if(entry.percent > 0)
        {
          diff = 1;
        }
        else {
          diff = -1;
        }
      }
      if(diff < 0)
      {
        chartColor = $("#red").css('background-color');
      }
      else
      {
        chartColor = $("#green").css('background-color');
      }

      this.watchlistCharts[entry.symbol] =  new Chart($("#" + entry.symbol + "graph"), {
        type: 'line',
        data: {
          labels: coinHistory,
          datasets: [{
            data: coinHistory,
            borderColor: chartColor,
            fill: false
          }]
        },
        options:
        {
          responsive: false,
          elements: {
            point: {
              radius: 0
            }
          },
          tooltips: {
            enabled: false
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: false
            }],
            yAxes: [{
              display: false,
            }],
          }
        }
      });
    }, 250);
  }

  aggregatePortfolioChartData(data, loader)
  {
    var aggregatedPortfolioData = [];
    let dataProcessed = 0;
    for(var i = 0; i < data.length; i++)
    {  
      let coinEquityData = data[i].Data.map((a) => (a.close * this.storedCoins.Coins[i].holdings));
      for(var j = 0; j< coinEquityData.length; j++)
      {
        let value = coinEquityData[j];
        if(value)
        {
          aggregatedPortfolioData[j] = (aggregatedPortfolioData[j] ? aggregatedPortfolioData[j] : 0) + value;
          dataProcessed++;
        }
        else
        {
          dataProcessed++;
        }
      }
      if(i == data.length - 1)
      {
        loader.dismiss();
        this.displayPortfolioChart(aggregatedPortfolioData);
      }
    }
  }

	displayPortfolioChart(aggregatedPortfolioData)
  {
    var coinThis = this;
		var active = false;
    setTimeout(() => {

      Chart.defaults.LineWithLine = Chart.defaults.line;
      
      Chart.controllers.LineWithLine = Chart.controllers.line.extend({
                
        draw: function (ease) {

          Chart.controllers.line.prototype.draw.call(this, ease);
          if(!this.chart.tooltip._active || this.chart.tooltip._active.length == 0)
          {
              if(active)
              {
                coinThis.setCurrentPrice();
                active = false;
              }
          }

          if (this.chart.tooltip._active && this.chart.tooltip._active.length)
          {
            if(!active) {active = true;}
            var activePoint = this.chart.tooltip._active[0],
              ctx = this.chart.ctx,
              x = activePoint.tooltipPosition().x,
              topY = this.chart.scales['y-axis-0'].top,
              bottomY = this.chart.scales['y-axis-0'].bottom;
            // draw line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 2;
            
            ctx.strokeStyle = '#E3E3E3';
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      this.currentAccountValue = aggregatedPortfolioData[aggregatedPortfolioData.length - 1];
      this.portfolioData['max'] = this.currentAccountValue;
      this.portfolioData['min'] = aggregatedPortfolioData[0];
      this.portfolioData['change'] = this.portfolioData['max'] - this.portfolioData['min'];
      this.portfolioData['percentChange'] = (this.portfolioData['change'] / this.currentAccountValue) * 100;

      this.storage.set("portfolioValue", this.currentAccountValue);
      if(!this.currentAccountValue)
      {
        this.currentAccountValue = 0;
        this.noData = true;
      }
      $("#menuPortfolioValueAmount").text(this._data['currencySign'] + this.currentAccountValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());
      $("#menuTotalInvestedAmount").text(this._data['currencySign'] + (this.investedAmount * -1).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());

      if(this.startup)
      {
        this.startup = false;
        this.numberAnimation();
      }
      
      let chartColor = "";
      let change = this.portfolioData['max'] - this.portfolioData['min'];
      if(change < 0)
      {
        chartColor = $("#red").css('background-color');
      }
      else
      {
        chartColor = $("#green").css('background-color');
      }

      this.currentChart = new Chart($("#portfolioChart"), {
        type: 'LineWithLine',
        data: {
          labels: aggregatedPortfolioData,
          datasets: [{
            data: aggregatedPortfolioData,
            borderColor: chartColor,
            backgroundColor : "#383838",
            fill: false 
          }]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
          elements: {
            point: {
              radius: 0
            }
          },
          tooltips: {
            intersect: false,
            mode: 'index',
            backgroundColor : "rgba(0,0,0,0.0)",
            titleFontColor : "rgba(0,0,0,0.0)",
            callbacks: {
              label: function (tooltipItems, data) {
                coinThis.numberAnimationOnHover(tooltipItems.yLabel);
                coinThis.startingPrice = tooltipItems.yLabel;
              }
            },
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: false
            }],
            yAxes: [{
              display: false,
            }],
          }
        }
      });

    }, 250);


	}

  setCurrentPrice()
  {
    var localThis = this;
    var actualPrice = this.currentAccountValue;
    $("#accountValue").prop('Counter',this.startingPrice).animate({
      Counter: actualPrice
    }, {
      duration: 200,
      easing: 'swing',
      step: function (now) {
        var numb = parseFloat(this.Counter);
        $("#accountValue").text(localThis._data['currencySign'] + numb.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());
      }
    });
  }

  numberAnimationOnHover(numberHover)
  {
    if(!isNaN(numberHover))
    {
      $("#accountValue").text(this._data['currencySign'] + numberHover.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());
    }
  }

  numberAnimation() {
    var localThis = this;
    var actualPrice = this.currentAccountValue;
    $({countNum: $("#accountValue").text()}).animate(
    {
      countNum: actualPrice
      },{
        duration: 2000,
        //easing: 'linear',
        step: function () {
          // What todo on every count
          var numb = parseFloat(this.countNum);
          $("#accountValue").text(localThis._data['currencySign'] + numb.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString());
        },
    });
  }

	getjustHoursOfDay()
  {
    var hours = [];
    for (var i = 0; i < 24; i++) {
      var _time;
		  _time = new Date().getTime() - (23 - i) * 60 * 60 * 1000;
		  var formattedTime = new Date(_time).toLocaleTimeString();
		  hours.push(formattedTime);
	  }
    return hours;
	}

	async removeCoin(coin)
  {
    var localThis = this;
    if(this.coinsOwned[coin])
    {
      if(this.coinsOwned[coin] > 0)
      {
        let alert = await this.alertCtrl.create({
        header: 'Erase Holdings',
        message: "Seems you have holdings in this coin. Removing this coin will remove the coin's transaction history. Would you still like to proceed?",
        buttons: [
          {
            text: 'No, Keep Coin',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Yes, Remove Coin',
            handler: () => {
              localThis._transactions.removeCoinData(coin);
              this.removeCoinFromWatchlist(coin);
            }
          }
        ]
      });
      alert.present();
      }
      else
      {
        this.removeCoinFromWatchlist(coin);      
      }
    }
    else
    {
      this.removeCoinFromWatchlist(coin);
    }
	}

  removeCoinFromWatchlist(coin)
  {
    var index;
		for(var i = 0; i < this.storedCoins.Coins.length; i++)
    {
      //this.storedCoins.Coins[i].chart = null;
      this.watchlistCharts[this.storedCoins.Coins[i].symbol] = null;
      if(this.storedCoins.Coins[i].symbol === coin)
      {
        index = i;
      }
    }
    if(index >= 0)
    {
      if(this.storedCoins.Coins.length == 1)
      {
        this.storedCoins = [];
      }
      else
      {
        this.storedCoins.Coins.splice(index, 1);
      }
      this.storage.set('storedCoins', this.storedCoins);
      this.startup = true;
      this.loadData();
    }
  }

  showWatchlistConfiguration() {
    this.startup = true;
    if(this.currentChart)
    {
      this.currentChart.destroy();   
    }
		//this.navCtrl.push(WatchlistConfigurationPage);
  }

  onOneHour()
  {
    $("button").removeClass("selected");
    $(".oneHour").addClass("selected");
    if(this.currentChart)
    {
      this.currentChart.destroy();
    }
    this._data.setSelectedTimeRange("hour");
    this.loadData();
  }

  onOneDay()
  {
    $("button").removeClass("selected");
    $(".oneDay").addClass("selected");
    if(this.currentChart)
    {
      this.currentChart.destroy();
    }
    this._data.setSelectedTimeRange("day");
    this.loadData();
  }

  onOneWeek()
  {
    $("button").removeClass("selected");
    $(".oneWeek").addClass("selected");
    if(this.currentChart)
    {
      this.currentChart.destroy();
    }
    this._data.setSelectedTimeRange("week");
    this.loadData();
  }

  onOneMonth()
  {
    $("button").removeClass("selected");
    $(".oneMonth").addClass("selected");
    if(this.currentChart)
    {
      this.currentChart.destroy();
    }
    this._data.setSelectedTimeRange("month");
    this.loadData();
  }

  onThreeMonths()
  {
    $("button").removeClass("selected");
    $(".threeMonths").addClass("selected");
    if(this.currentChart)
    {
      this.currentChart.destroy();
    }
    this._data.setSelectedTimeRange("three months");
    this.loadData();
  }

  onOneYear()
  {
    $("button").removeClass("selected");
    $(".oneYear").addClass("selected");
    if(this.currentChart)
    {
      this.currentChart.destroy();
    }
    this._data.setSelectedTimeRange("year");
    this.loadData();
  }

  onFiveYears()
  {
    $("button").removeClass("selected");
    $(".fiveYears").addClass("selected");
    if(this.currentChart)
    {
      this.currentChart.destroy();
    }
    this._data.setSelectedTimeRange("five years");
    this.loadData();
  }

    openPage(page)
    {
      //this.navCtrl.push(AddCoinPage);
    }

  clearGraph()
  {
    this.currentChart.destroy();
  }

  reorderItems(indexes)
  {
    let element = this.storedCoins.Coins[indexes.from];
    this.storedCoins.Coins.splice(indexes.from, 1);
    this.storedCoins.Coins.splice(indexes.to, 0, element);
    this.storage.set('storedCoins', this.storedCoins);
  }

  close()
  {
    console.log("here");
    this.watchlistPopup.dismiss();
  }
} 