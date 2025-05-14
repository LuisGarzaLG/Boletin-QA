import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { qualityrequestsprovaider } from 'src/app/providers/services/quality request/qualityBrequestsprovaider';
import { ButtonRenderComponent } from './button-render/button-render.component';
import { NotificationService } from 'src/app/providers/services/notification/notification.service';
import { FormBuilder } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { CheckboxRenderComponent } from './checkbox-render/checkbox-render.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  loading: boolean = false;
  
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
  const currentUsers = sessionStorage;
  console.log(currentUsers);

  if (currentUser) {
    const user = JSON.parse(currentUser);
    const email = user.email;
    const name = user.name; // Cambia `givenName` por `name` si prefieres otro campo
    console.log('Name:', name); // Muestra el nombre en consola
    this.currentUser = name; // Asigna el nombre del usuario a la propiedad currentUser
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

currentUser: string = ''; // Inicializa como vacío, y luego se asignará el nombre del usuario


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
      creatorName:{
        title:'Usuario',
        type: 'string'
      },
      
      inProduction: {
      title: 'Estatus',
      type: 'custom',
      renderComponent: CheckboxRenderComponent,
      filter: false,
      onComponentInitFunction: (instance: any) => {
        instance.currentUser = this.currentUser;
        instance.save.subscribe((data: any) => {
          //this.actualizarEstadoProduccion(data.rowData.bulletinID, data.value);
        });
      }
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


  private subscribeToData(): void {
    this.provider.bulletins$.subscribe(
      (data) => this.sourceTab.load(data),
      (error) => console.error(error)
    );
  }
/*
  exportToExcel(): void {
  this.sourceTab.getFilteredAndSorted().then(data => {
    // Crear una nueva instancia de un libro de trabajo (workbook)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bulletin QA');

    // Definir las cabeceras de la tabla
    worksheet.columns = [
      { header: 'Número de Boletín', key: 'bulletinID', width: 20 },
      { header: 'Area', key: 'area', width: 20 },
      { header: 'Número de Parte', key: 'partNumber', width: 20 },
      { header: 'Fecha', key: 'startDate', width: 20 },
      { header: 'Fecha de Vencimiento', key: 'endDate', width: 20 },
      { header: 'Cliente', key: 'customer', width: 20 },
      { header: 'Proveedor', key: 'supplier', width: 20 },
      { header: 'Nombre del Problema', key: 'name', width: 20 },
      { header: 'Modo de Falla', key: 'failureName', width: 20 },
      { header: 'Id Previo', key: 'previousID', width: 20 },
      { header: 'Usuario', key: 'users', width: 20 },
    ];

    // Llenar las filas con los datos obtenidos
    data.forEach((item: any) => {
      worksheet.addRow({
        bulletinID: item.bulletinID,
        area: item.area,
        partNumber: item.partNumber,
        startDate: new Date(item.startDate).toLocaleDateString(),
        endDate: new Date(item.endDate).toLocaleDateString(),
        customer: item.customer,
        supplier: item.supplier,
        name: item.name,
        failureName: item.failureName,
        previousID: item.previousID,
        users: item.users
      });
    });

    // Aplicar bordes y estilos
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        if (rowNumber === 1) {
          cell.font = { bold: true }; // Negrita en la primera fila (cabecera)
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Crear un buffer del archivo Excel
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      // Crear el Blob y descargar el archivo
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, 'BulletinQA.xlsx');
    });
  });
}
  
  */


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