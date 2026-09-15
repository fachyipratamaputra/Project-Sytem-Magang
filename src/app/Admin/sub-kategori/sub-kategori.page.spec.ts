import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubKategoriPage } from './sub-kategori.page';

describe('SubKategoriPage', () => {
  let component: SubKategoriPage;
  let fixture: ComponentFixture<SubKategoriPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubKategoriPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
