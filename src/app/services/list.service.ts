//import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  viewer : string;

  constructor(private storage: Storage)
  {
    //getting setting for which home values user has saved in the watchlist
    this.storage.get('homeList').then((val) => {
      console.log(val);
			if(!val)
      {
        this.viewer = "Last Price";
      }
      else
      {
        this.viewer = val;
      }
    });
  }

  onChange(value)
  {
    this.storage.set('homeList', value);
    this.viewer = value;
  }
}