import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy, Routes } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ListOptionsComponent } from './list-options/list-options.component';

import { HttpClientModule } from '@angular/common/http';
import { SQLite, SQLiteDatabaseConfig } from '@ionic-native/sqlite/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { DataService } from './services/data.service';
import { DatabaseService } from './services/database.service';
import { ListService } from './services/list.service';
import { FormsModule } from '../../node_modules/@angular/forms';

declare var SQL;

export class SQLiteObject{
    _objectInstance: any;

    constructor(_objectInstance: any){
      this._objectInstance = _objectInstance;
    };

    executeSql(statement: string, params: any): Promise<any>{

      return new Promise((resolve,reject)=>{
        try {
          console.log(statement)
          var st = this._objectInstance.prepare(statement,params);
          var rows :Array<any> = [] ;
          while(st.step()) {
            var row = st.getAsObject();
            rows.push(row);
          }
          var payload = {
            rows: {
              item: function(i) {
                return rows[i];
              },
              length: rows.length
            },
            rowsAffected: this._objectInstance.getRowsModified() || 0,
            insertId: this._objectInstance.insertId || void 0
          };
          //save database after each sql query
          var arr : ArrayBuffer = this._objectInstance.export();
          localStorage.setItem("database",String(arr));
          resolve(payload);
        } catch(e){
          reject(e);
        }
      });
    };

    sqlBatch(statements: string[], params: any): Promise<any>{
      return new Promise((resolve,reject)=>{
        try {
          var rows :Array<any> = [];
          for (let statement of statements) {
            console.log(statement);
            var st = this._objectInstance.prepare(statement,params);
            while(st.step()) {
                var row = st.getAsObject();
                rows.push(row);
            }
          }
          var payload = {
            rows: {
              item: function(i) {
                return rows[i];
              },
              length: rows.length
            },
            rowsAffected: this._objectInstance.getRowsModified(),
            insertId: this._objectInstance.insertId || void 0
          };
          //save database after each sql query
          var arr : ArrayBuffer = this._objectInstance.export();
          localStorage.setItem("database",String(arr));
          resolve(payload);
        } catch(e){
          reject(e);
        }
      });
    };
}

/*
  Implemented using edited code from actual cordova plugin
*/
export class SQLitePorterMock {
    /**
     * Trims leading and trailing whitespace from a string
     * @param {string} str - untrimmed string
     * @returns {string} trimmed string
     */


    trimWhitespace(str){
      return str.replace(/^\s+/,"").replace(/\s+$/,"");
    }

    importSqlToDb(db, sql, opts = {}){
      try {
        const statementRegEx = /(?!\s|;|$)(?:[^;"']*(?:"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*')?)*/g;
        var statements = sql
          .replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm,"") // strip out comments
          .match(statementRegEx);

        if(statements === null || (Array.isArray && !Array.isArray(statements))) statements = [];

        // Strip empty statements
        for(var i = 0; i < statements.length; i++){
          if(!statements[i]){
              delete statements[i];
          }
        }
        return db.sqlBatch(statements)
      } catch(e) {
        console.error(e.message);
      }
    }
}

export class SQLiteMock {

  public create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
    var db;
    var storeddb = localStorage.getItem("database");

    if(storeddb) {
      var arr = storeddb.split(',');
      db = new SQL.Database(arr);
    }
    else {
       db = new SQL.Database();
    }

    return new Promise((resolve,reject)=>{
      resolve(new SQLiteObject(db));
    });
  }
}

@NgModule({
  declarations: [AppComponent, ListOptionsComponent],
  entryComponents: [ListOptionsComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, IonicStorageModule.forRoot(), FormsModule],
  providers: [
    SQLite,
    StatusBar,
    SplashScreen,
    ErrorHandler,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: SQLite, useClass: SQLiteMock},
    DataService,
    DatabaseService,
    ListService,
    Clipboard,
    Network,
  ],
  bootstrap: [AppComponent]
})

export class AppModule {}
