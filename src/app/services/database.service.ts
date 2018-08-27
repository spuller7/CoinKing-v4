import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import * as dateFormat from 'dateformat';
//npm install dateformat

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  db : SQLiteObject = null;
  transactions : Array<Object> = [];
  amountOwned : Array<Object>;
  investmentAmount : Array<Object>;

  constructor(public http: HttpClient, private sqlite: SQLite) {
    //this.openDatabase();
  }

  openDatabase()
  {
    this.sqlite.create({
      name : 'transactions.db',
      location : 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;
      //this.db.executeSql("DROP TABLE transactions", []);
      let sql = 'CREATE TABLE IF NOT EXISTS transactions(id INTEGER PRIMARY KEY AUTOINCREMENT, submitted_date INTEGER, coin_symbol STRING, transaction_type STRING, transaction_date INTEGER, amount INTEGER, price INTEGER)';
    return this.db.executeSql(sql, []);
    });
  }

  insertNewTransaction(submitted_date, coin_symbol, transaction_type, transaction_date, amount, price)
  {
    let sql = 'INSERT INTO transactions(submitted_date, coin_symbol, transaction_type, transaction_date, amount, price) VALUES ('+submitted_date+',"'+coin_symbol+'","'+transaction_type+'",'+transaction_date+','+amount+','+price+')';
    return this.db.executeSql(sql, []);
  }

  removeCoinData(coin_symbol)
  {
    let sql = 'DELETE FROM transactions WHERE coin_symbol = "'+coin_symbol+'"';
    return this.db.executeSql(sql, []);
  }

  readTransactionTable(coin_symbol = null)
  {
    let sql = "";
    if(coin_symbol)
    {
      sql = 'SELECT * FROM transactions WHERE coin_symbol="'+coin_symbol+'" ORDER BY submitted_date DESC LIMIT 5';
    }
    else
    {
      sql = 'SELECT * FROM transactions ORDER BY submitted_date DESC LIMIT 150';
    }

    this.transactions = [];
    return this.db.executeSql(sql, []).then(response => {
      for(let i = 0; i < response.rows.length; i++)
      {
        response.rows.item(i).transaction_date = dateFormat(new Date(response.rows.item(i).transaction_date * 1000), "mm/dd/yy");
        this.transactions.push(response.rows.item(i));
      }
      return Promise.resolve(this.transactions);
    });
  }

  getOwnedCoinAmount()
  {
    let sql = 'SELECT buys.coin_symbol AS coin_symbol, (buys.total_buys - IFNULL(sells.total_sells,0)) AS amount_owned FROM (SELECT SUM(amount) as total_buys, coin_symbol FROM transactions WHERE transaction_type="Buy" GROUP BY coin_symbol) AS buys LEFT OUTER JOIN (SELECT SUM(amount) as total_sells, coin_symbol FROM transactions WHERE transaction_type="Sell" GROUP BY coin_symbol) AS sells ON buys.coin_symbol = sells.coin_symbol';
    this.amountOwned = [];
    return this.db.executeSql(sql, []).then(response => {
      for(let i = 0; i < response.rows.length; i++)
      {
        this.amountOwned[response.rows.item(i).coin_symbol] = response.rows.item(i).amount_owned;
      }
      return Promise.resolve(this.amountOwned);
    });
  }

  getCoinHolding(coin)
  {
    let sql = 'SELECT buys.coin_symbol AS coin_symbol, (buys.total_buys - IFNULL(sells.total_sells,0)) AS amount_owned FROM (SELECT SUM(amount) as total_buys, coin_symbol FROM transactions WHERE transaction_type="Buy" AND coin_symbol = "' + coin + '" GROUP BY coin_symbol) AS buys LEFT OUTER JOIN (SELECT SUM(amount) as total_sells, coin_symbol FROM transactions WHERE transaction_type="Sell" AND coin_symbol = "' + coin + '" GROUP BY coin_symbol) AS sells ON buys.coin_symbol = sells.coin_symbol';
    this.amountOwned = [];
    return this.db.executeSql(sql, []).then(response => {
      for(let i = 0; i < response.rows.length; i++)
      {
        this.amountOwned[response.rows.item(i).coin_symbol] = response.rows.item(i).amount_owned;
      }
      return Promise.resolve(this.amountOwned);
    });
  }

  //get total gain/loss data
  getCoinInvestmentAmount()
  {
    let sql = 'SELECT buys.coin_symbol AS coin_symbol, (IFNULL(sells.total_sells_amount,0) - buys.total_buys_amount) AS investment FROM (SELECT SUM(price * amount) as total_buys_amount, coin_symbol FROM transactions WHERE transaction_type="Buy" GROUP BY coin_symbol) AS buys LEFT OUTER JOIN (SELECT SUM(price * amount) as total_sells_amount, coin_symbol FROM transactions WHERE transaction_type="Sell" GROUP BY coin_symbol) AS sells ON buys.coin_symbol = sells.coin_symbol';
    this.investmentAmount = [];
    return this.db.executeSql(sql, []).then(response => {
      for(let i = 0; i < response.rows.length; i++)
      {
        this.investmentAmount[response.rows.item(i).coin_symbol] = response.rows.item(i).investment;
      }
      console.log(this.investmentAmount);
      return Promise.resolve(this.investmentAmount);
    });
  }

  deleteTransaction(id)
  {
    let sql = 'DELETE FROM transactions WHERE id = ?';
    return this.db.executeSql(sql, [id]);
  }

}