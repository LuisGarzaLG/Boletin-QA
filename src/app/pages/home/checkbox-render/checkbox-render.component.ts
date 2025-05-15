import { Component, Input, OnInit,Output, EventEmitter } from '@angular/core';

// ✅ SIN CAMBIOS en checkbox-render.component.ts
@Component({
  selector: 'app-checkbox-render',
  template: `
    <div style="text-align: center">
      <input
        type="checkbox"
        [checked]="value"
        (change)="toggle($event)"
        [disabled]="!isEditable"
      />
      <div
        [ngStyle]="{ color: value ? 'red' : 'green', 'font-size': '12px', 'margin-top': '4px' }"
      >
        {{ value ? 'Retirado' : 'Activo' }}
      </div>
    </div>
  `
})
export class CheckboxRenderComponent implements OnInit {
  @Input() value: boolean = false;
  @Input() rowData: any;
  @Input() currentUser: string = '';
  @Output() save = new EventEmitter<any>();

  isEditable: any;

  ngOnInit() {
    this.isEditable = this.rowData?.creatorUser === this.currentUser;
  }

  toggle(event: any) {
    const newValue = event.target.checked;
    this.value = newValue;
    this.save.emit({ value: newValue, rowData: this.rowData });
  }
}
