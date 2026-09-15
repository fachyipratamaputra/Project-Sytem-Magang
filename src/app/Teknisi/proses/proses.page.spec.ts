import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProsesPage } from './proses.page';

describe('ProsesPage', () => {
  let component: ProsesPage;
  let fixture: ComponentFixture<ProsesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProsesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
