import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiwayatPage } from './riwayat.page';

describe('RiwayatPage', () => {
  let component: RiwayatPage;
  let fixture: ComponentFixture<RiwayatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RiwayatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
