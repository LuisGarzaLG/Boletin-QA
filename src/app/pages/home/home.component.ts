import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { qualityrequestsprovaider } from 'src/app/providers/services/quality request/qualityBrequestsprovaider';
import { ButtonRenderComponent } from './button-render/button-render.component';
import { NotificationService } from 'src/app/providers/services/notification/notification.service';
import { FormBuilder } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loading: boolean = false;

  BulletinQA = {
    actions: {
      add: false,
      edit: false,
      delete: false
    },
    pager: {
      display: true,
      perPage: 50,
    },
    columns: {
      bulletinID: {
        title: 'Número de Boletín',
        type: 'string',
      },
      area: {
        title: 'Area',
        type: 'string'
      },
      partNumber: {
        title: 'Número de Parte',
        type: 'string'
      },
      startDate: {
        title: 'Fecha',
        type: 'html',
        valuePrepareFunction: (date: string) => {
          return new Date(date).toLocaleDateString();
        },
      },
      endDate: {
        title: 'Fecha de Vencimiento',
        type: 'html',
        valuePrepareFunction: (date: string) => {
          return new Date(date).toLocaleDateString();
        },
      },
      customer: {
        title: 'Cliente',
        type: 'string'
      },
      supplier: {
        title: 'Proveedor',
        type: 'string'
      },
      name: {
        title: 'Nombre del Problema',
        type: 'string'
      },
      failureName: {
        title: 'Modo de Falla',
        type: 'string'
      },
      previousID: {
        title: 'Id Previo',
        type: 'string'
      },
      details: {
        title: 'Detalles',
        type: 'custom',
        renderComponent: ButtonRenderComponent,
        filter: false,
        onComponentInitFunction: (instance: any) => {
          instance.save.subscribe((row: any) => {
            this.loadBoletinDetalle(row.bulletinID);
          });
        }
      }
    }
  };

  sourceTab: LocalDataSource = new LocalDataSource();
  detallesSource: LocalDataSource = new LocalDataSource();
  userRoles: string[]=[];
  

  constructor(
    private router: Router,
    private provider: qualityrequestsprovaider,
    private notificationService: NotificationService,
    private fb:FormBuilder
  ) { }

  ngOnInit(): void {
    this.subscribeToData();
    if (this.provider.currentbulletin.length === 0) {
      this.provider.refreshdata();
    }


const currentUser = sessionStorage.getItem('currentUser');


if (currentUser) {
  const user = JSON.parse(currentUser);
  const email = user.email;
  //console.log('Email:', email);
}

const rolesStorage = sessionStorage.getItem('roles');
if (rolesStorage) {
  this.userRoles = JSON.parse(rolesStorage); // ["BulletinQA", "ESDManager"]
  //console.log('Roles:', this.userRoles);

    setTimeout(() => {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach((ta: any) => this.autoResize(ta));
    }, 0);
    
    
  }
}

  private subscribeToData(): void {
    this.provider.bulletins$.subscribe(
      (data) => this.sourceTab.load(data),
      (error) => console.error(error)
    );
  }

  exportToExcel(): void {
    this.sourceTab.getFilteredAndSorted().then(data => {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  
      // Aplicar bordes y estilos básicos
      const range = XLSX.utils.decode_range(worksheet['!ref']!);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = { c: C, r: R };
          const cell_ref = XLSX.utils.encode_cell(cell_address);
  
          if (!worksheet[cell_ref]) continue;
  
          worksheet[cell_ref].s = {
            border: {
              top: { style: 'thin', color: { rgb: "000000" } },
              bottom: { style: 'thin', color: { rgb: "000000" } },
              left: { style: 'thin', color: { rgb: "000000" } },
              right: { style: 'thin', color: { rgb: "000000" } }
            },
            font: {
              bold: R === 0, // Poner en negrita solo la primera fila (cabeceras)
            },
            alignment: {
              vertical: "center",
              horizontal: "center",
              wrapText: true
            }
          };
        }
      }
  
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Bulletin QA': worksheet },
        SheetNames: ['Bulletin QA']
      };
  
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });
      const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'BulletinQA.xlsx');
    });
  }
  
  


  mostrarDetalle = false;
bulletinID: string = '';
selectedRow: any = null;

detallesForm = this.fb.group({
  bulletinID: [''],
  description:[''],
  action:[''],
  reworkDetails:[''],
  qualityPhotos:[null],
  defectPhotos:[null]
});


async loadBoletinDetalle(bulletinID: string): Promise<void> {
  try {
    // Obtener detalles del boletín
    const data = await this.provider.GetDetailsBy(bulletinID);
    const additionalPhotos = await this.provider.GetBulletinPhotosBy(bulletinID);
    const detallesBoletin = Array.isArray(data) ? data : [];

    // Obtener la fila seleccionada de la tabla
    const rows = await this.sourceTab.getAll();
    const selectedRow = rows.find((item: any) => item.bulletinID === bulletinID);

    if (selectedRow) {
      const patch: any = {
        bulletinID: selectedRow.bulletinID,
        description: data?.description,
        action: data?.actions,
        reworkDetails: data?.reworkDetails,
        qualityPhotos: Array.isArray(data?.photos?.qualityPhotos)
          ? data?.photos.qualityPhotos
          : data?.photos?.qualityPhotos ? [data?.photos?.qualityPhotos] : [],
        defectPhotos: Array.isArray(data?.photos?.defectPhotos)
          ? data?.photos.defectPhotos
          : data?.photos?.defectPhotos ? [data?.photos?.defectPhotos] : [],
      };

      // Si existen fotos adicionales, agregar a las fotos de calidad y defecto si no están ya presentes
      if (additionalPhotos && Array.isArray(additionalPhotos)) {
        additionalPhotos.forEach(photo => {
          // Agregar fotos de calidad solo si no están en los detalles originales
          if (photo.qualityPhotos && !patch.qualityPhotos.includes(photo.qualityPhotos)) {
            patch.qualityPhotos.push(photo.qualityPhotos); // Asegúrate de que sea base64
          }
          // Agregar fotos de defecto solo si no están en los detalles originales
          if (photo.defectPhotos && !patch.defectPhotos.includes(photo.defectPhotos)) {
            patch.defectPhotos.push(photo.defectPhotos); // Asegúrate de que sea base64
          }
        });
      }

      this.detallesForm.patchValue(patch);
      this.detallesForm.disable();
    }

    this.detallesSource.load(detallesBoletin);
    this.mostrarDetalle = true;
  } catch (error) {
    console.error('Error al cargar detalle del boletín:', error);
    this.notificationService.error('No se pudo cargar el detalle del boletín');
  }
}




cerrarFormulario(): void {
  this.mostrarDetalle = false; // Cierra el formulario cuando se hace clic en el fondo
}

autoResize(textarea: HTMLTextAreaElement): void {
  textarea.style.height = 'auto'; // Reinicia el alto para calcular bien
  textarea.style.height = textarea.scrollHeight + 'px'; // Ajusta al contenido
}



}