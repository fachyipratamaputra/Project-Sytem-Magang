import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JabatanPage } from './jabatan.page';

describe('JabatanPage', () => {
  let component: JabatanPage;
  let fixture: ComponentFixture<JabatanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JabatanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
