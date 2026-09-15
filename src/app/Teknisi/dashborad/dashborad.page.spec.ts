import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboradPage } from './dashborad.page';

describe('DashboradPage', () => {
  let component: DashboradPage;
  let fixture: ComponentFixture<DashboradPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboradPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
