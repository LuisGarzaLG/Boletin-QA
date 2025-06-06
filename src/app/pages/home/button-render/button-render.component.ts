import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button-render',
  template: `<button nbButton size="small" status="info" (click)="showDetails()">Detalles</button>`,
  styleUrls: ['./button-render.component.scss']
})
export class ButtonRenderComponent {
  @Input() rowData: any;
  @Output() save = new EventEmitter<any>(); // <- CAMBIADO a 'save'

  showDetails() {
    //console.log('Detalles:', this.rowData);
    this.save.emit(this.rowData); // <- EMITE como 'save'
  }
}
