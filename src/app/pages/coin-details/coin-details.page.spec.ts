import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinDetailsPage } from './coin-details.page';

describe('CoinDetailsPage', () => {
  let component: CoinDetailsPage;
  let fixture: ComponentFixture<CoinDetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinDetailsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
