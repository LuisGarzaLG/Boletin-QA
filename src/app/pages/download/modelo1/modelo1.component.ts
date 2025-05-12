import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modelo1',
  templateUrl: './modelo1.component.html',
  styleUrls: ['./modelo1.component.scss']
})
export class Modelo1Component {
  @Input() bulletinform!: FormGroup;
  @Input() detailsform!: FormGroup;
  @Input() qualityPhotosBase64: string | null = null;
  @Input() defectPhotosBase64: string | null = null;
 
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
