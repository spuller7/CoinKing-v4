import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  result: any;
  selectedTimeRange: string;
  public currency = "";
  currencySymbol = "USD";
  currencySign = "";

  constructor(public _http: HttpClient, private storage : Storage) {
    this.selectedTimeRange = "day";
    this.updateCurrency();
  }

  getCoins(coins) {
    let coinlist = '';

    coinlist = coins.join();

    return this._http.get("https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + coinlist + "&tsyms=" + this.currencySymbol + "");
  }

  getCoin(coin) {
    return this._http.get("https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + coin + "&tsyms=" + this.currencySymbol + "");
  }

  getCoinID(coin)
  {
    return this._http.get("https://www.cryptocompare.com/api/data/coinlist/");
  }

  getCoinDescription(id)
  {
    return this._http.get("https://www.cryptocompare.com/api/data/coinsnapshotfullbyid/?id=" + id + "");
  }

  getMultiCoinData(coinSymbols)
  {
    let observables = [];
    for(var i = 0; i < coinSymbols.length; i++)
    {
      observables.push(this._http.get("https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + coinSymbols[i] + "&tsyms=" + this.currencySymbol + ""));
    }
    return observables;
  }

  getChart(coin, mini = false) {
    if(mini)
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histominute?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=37&aggregate=21");
    }
    else
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histominute?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=720&aggregate=2");
      }
  }

  getMultiChartData(coinSymbols, timeRange)
  {
    let observables = [];
    for(var i = 0; i < coinSymbols.length; i++)
    {
      switch(timeRange)
      {
        case 'hour':
          observables.push(this._http.get("https://min-api.cryptocompare.com/data/histominute?fsym=" + coinSymbols[i] + "&tsym=" + this.currencySymbol + "&limit=30&aggregate=2"));
          break;
        case 'week':
          observables.push(this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coinSymbols[i] + "&tsym=" + this.currencySymbol + "&limit=28&aggregate=4"));
          break;
        case 'month':
          observables.push(this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coinSymbols[i] + "&tsym=" + this.currencySymbol + "&limit=36&aggregate=21"));
          break;
        case 'three months':
          observables.push(this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coinSymbols[i] + "&tsym=" + this.currencySymbol + "&limit=36&aggregate=63"));
          break;
        case 'year':
          observables.push(this._http.get("https://min-api.cryptocompare.com/data/histoday?fsym=" + coinSymbols[i] + "&tsym=" + this.currencySymbol + "&limit=25&aggregate=15"));
          break;
        case 'five years':
          observables.push(this._http.get("https://min-api.cryptocompare.com/data/histoday?fsym=" + coinSymbols[i] + "&tsym=" + this.currencySymbol + "&limit=37&aggregate=30"));
          break;
        default:
          observables.push(this._http.get("https://min-api.cryptocompare.com/data/histominute?fsym=" + coinSymbols[i] + "&tsym=" + this.currencySymbol + "&limit=720&aggregate=2"));
      }
    }
    return observables;
  }

  getChartHour(coin, mini = false)
  {
    if(mini)
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histominute?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=30&aggregate=2");
    }
    else
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histominute?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=60&aggregate=1");
    }
  }

  getChartWeek(coin, mini = false)
  {
    if(mini)
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=28&aggregate=4");
    }
    else{
      return this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=168&aggregate=1");
    }
  }
  getChartMonth(coin, mini = false)
  {
    if(mini)
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=36&aggregate=21");
    }
    else
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=720&aggregate=2");
    }
  }
  getChartThreeMonths(coin, mini = false)
  {
    if(mini)
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=36&aggregate=63");
    }
    else
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histohour?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=2160&aggregate=4");
    }
  }
  getChartOneYear(coin, mini = false)
  {
    if(mini)
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histoday?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=25&aggregate=15");
    }
    else
    {
       return this._http.get("https://min-api.cryptocompare.com/data/histoday?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=365&aggregate=1");
    }
  }
  getChartFiveYears(coin, mini = false)
  {
    if(mini)
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histoday?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=37&aggregate=30");
    }
    else
    {
      return this._http.get("https://min-api.cryptocompare.com/data/histoday?fsym=" + coin + "&tsym=" + this.currencySymbol + "&limit=1825&aggregate=5");
    }
  }

  allCoins() {
    return this._http.get("https://api.coinmarketcap.com/v2/listings/");
  }

  createCoinObject(name, symbol, imageURL, ccID)
  {
    return new coinData(name, symbol, imageURL, ccID);
  }

  createTransactionData(symbol, type, date, amount, price)
  {
    return new transanctionData(symbol, type, date, amount, price);
  }

  getSelectedTimeRange()
  {
    return this.selectedTimeRange;
  }
  setSelectedTimeRange(selectedTimeRange)
  {
    this.selectedTimeRange = selectedTimeRange;
  }

  findImageURL(coin)
  {
    return this._http.get("https://api.coinmarketcap.com/v2/listings/");
  }

  getCoinMarketCapList(start = 0, limit = 100)
  {
    return this._http.get("https://api.coinmarketcap.com/v2/ticker/?start=" + start + "&limit=" + limit);
  }

  updateCurrency()
  {
    this.storage.get('currency').then((val) => {
      this.currency = val;

      if(val == "Euro")
      {
        this.currencySymbol = "EUR";
        this.currencySign = "€";
      }
      else if(val == "Bitcoin")
      {
        this.currencySymbol = "BTC";
        this.currencySign = "฿";
      }
      else
      {
        this.currencySymbol = "USD";
        this.currencySign = "$";
      }
    });
  }
}

function coinData(name, symbol, imageURL, ccID)
{
  this.name = name;
  this.symbol = symbol;
  this.price = null;
  this.chart = null;
  this.imageURL = imageURL;
  this.ccID = ccID;
}

function transanctionData(symbol, type, date, amount, price)
{
  this.symbol = symbol;
  this.type = type;
  this.date = date;
  this.amount = amount;
  this.price = price;
}