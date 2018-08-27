import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { ListService } from '../services/list.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-list-options',
  templateUrl: './list-options.component.html',
  styleUrls: ['./list-options.component.scss']
})
export class ListOptionsComponent {

  public list_value : any;
  selectedID = "Last Price";
  text: string;
  pop: PopoverController;

  constructor(private _list : ListService, private navParams : NavParams)
  {
    this.list_value = _list.viewer;
    this.pop = navParams.get('popoverController');
  } 

  ionRadioDidLoad()
  {
    console.log("here");
  }

  changeWatchlistItem(value)
  {
    this._list.onChange(value);
    if(value != this.list_value)
    {
      this.pop.dismiss();
    }
  }

  addselect()
  {
    $("#last_price").attr("checked", "checked");
  }
}