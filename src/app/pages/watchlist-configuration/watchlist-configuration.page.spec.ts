import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistConfigurationPage } from './watchlist-configuration.page';

describe('WatchlistConfigurationPage', () => {
  let component: WatchlistConfigurationPage;
  let fixture: ComponentFixture<WatchlistConfigurationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchlistConfigurationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchlistConfigurationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
