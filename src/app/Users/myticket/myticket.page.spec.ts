import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyticketPage } from './myticket.page';

describe('MyticketPage', () => {
  let component: MyticketPage;
  let fixture: ComponentFixture<MyticketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyticketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
