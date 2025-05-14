import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxRenderComponent } from './checkbox-render.component';

describe('CheckboxRenderComponent', () => {
  let component: CheckboxRenderComponent;
  let fixture: ComponentFixture<CheckboxRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckboxRenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
