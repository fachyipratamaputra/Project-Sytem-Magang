import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KaryawanPage } from './karyawan.page';

describe('KaryawanPage', () => {
  let component: KaryawanPage;
  let fixture: ComponentFixture<KaryawanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KaryawanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
