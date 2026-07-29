import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartemenPage } from './departemen.page';

describe('DepartemenPage', () => {
  let component: DepartemenPage;
  let fixture: ComponentFixture<DepartemenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartemenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
