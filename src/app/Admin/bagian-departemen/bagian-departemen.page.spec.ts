import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BagianDepartemenPage } from './bagian-departemen.page';

describe('BagianDepartemenPage', () => {
  let component: BagianDepartemenPage;
  let fixture: ComponentFixture<BagianDepartemenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BagianDepartemenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
