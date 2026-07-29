import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KategoriPage } from './kategori.page';

describe('KategoriPage', () => {
  let component: KategoriPage;
  let fixture: ComponentFixture<KategoriPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KategoriPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
