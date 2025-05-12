import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modelo1Component } from './modelo1.component';

describe('Modelo1Component', () => {
  let component: Modelo1Component;
  let fixture: ComponentFixture<Modelo1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Modelo1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Modelo1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
