import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeknisiPage } from './teknisi.page';

describe('TeknisiPage', () => {
  let component: TeknisiPage;
  let fixture: ComponentFixture<TeknisiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeknisiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
