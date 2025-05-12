import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modelo2',
  templateUrl: './modelo2.component.html',
  styleUrls: ['./modelo2.component.scss']
})
export class Modelo2Component {
  @Input() bulletinform!: FormGroup;
  @Input() detailsform!: FormGroup;
  @Input() uploadphotos!: FormGroup;
  @Input() qualityPhotosBase64: string | null = null;
  @Input() defectPhotosBase64: string | null = null;
  @Input() qualityPhotosBase641: string | null = null;
  @Input() defectPhotosBase641: string | null = null;
 
  // Define el método onSearchBoth
  onSearchBoth(): void {
    if (this.bulletinform.valid && this.detailsform.valid) {
      // Lógica que deseas ejecutar cuando el formulario sea válido
      console.log("Formulários válidos");
    } else {
      console.log("Formulários inválidos");
    }
  }
}
