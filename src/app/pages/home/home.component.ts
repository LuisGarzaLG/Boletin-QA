import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { qualityrequestsprovaider } from 'src/app/providers/services/quality request/qualityBrequestsprovaider';
import { ButtonRenderComponent } from './button-render/button-render.component';
import { NotificationService } from 'src/app/providers/services/notification/notification.service';
import { FormBuilder } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { CheckboxRenderComponent } from './checkbox-render/checkbox-render.component';
import * as ExcelJS from 'exceljs';
import { from } from 'rxjs';
import axios from 'axios';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  loading: boolean = false;
  
  sourceTab: LocalDataSource = new LocalDataSource();
  sourceTabVencidos: LocalDataSource = new LocalDataSource();
  detallesSource: LocalDataSource = new LocalDataSource();
  userRoles: string[] = [];

  constructor(
    private router: Router,
    private provider: qualityrequestsprovaider,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.subscribeToData();
    if (this.provider.currentbulletin.length === 0) {
      this.provider.refreshdata();
    }
//#region  ssesion Storage
    const currentUser = sessionStorage.getItem('currentUser');
    const currentUsers = sessionStorage;
    ////console.log(currentUsers);

    if (currentUser) {
      const user = JSON.parse(currentUser);
      const email = user.email;
      const name = user.name; // Cambia `givenName` por `name` si prefieres otro campo
      ////console.log('Name:', name); // Muestra el nombre en consola
      this.currentUser = name; // Asigna el nombre del usuario a la propiedad currentUser
    }

    const rolesStorage = sessionStorage.getItem('roles');
    if (rolesStorage) {
      this.userRoles = JSON.parse(rolesStorage); // ["BulletinQA", "ESDManager"]
      ////console.log('Roles:', this.userRoles);
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach((ta: any) => this.autoResize(ta));
      }, 0);
    }
    //#endregion
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
      impressions:{
        title:'Impresiones',
        type:'number'
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
            this.updateProductionStatus(data.rowData.bulletinID, data.value);
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

async subscribeToData(): Promise<void> {
  try {
    this.loading = true;

    // Cargar datos en sourceTab (boletines activos u otro conjunto)
    const bulletins = await this.provider.GetAllBulletin();
    this.sourceTab.load(bulletins);

    // Cargar boletines no vencidos en sourceTabVencidos con el nuevo método
    await this.loadNonExpiredBulletins();

  } catch (error) {
    //console.error('Error cargando datos:', error);
    this.notificationService.error('No se pudieron cargar los datos de boletines');
  } finally {
    this.loading = false;
  }
}


exportToExcel(source: LocalDataSource, nombreArchivo: string): void {
  source.getFilteredAndSorted().then(async data => {
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet('Bulletin QA');
    const detailSheet = workbook.addWorksheet('Detalles');

    // === 2. DEFINIR COLUMNAS Y ENCABEZADO ===
    mainSheet.columns = [
      { header: 'Número de Boletín', key: 'bulletinID', width: 20 },
      { header: 'Impresiones', key: 'impressions', width: 20 },
      { header: 'Área', key: 'area', width: 20 },
      { header: 'Número de Parte', key: 'partNumber', width: 20 },
      { header: 'Fecha', key: 'startDate', width: 20 },
      { header: 'Fecha de Vencimiento', key: 'endDate', width: 20 },
      { header: 'Cliente', key: 'customer', width: 20 },
      { header: 'Proveedor', key: 'supplier', width: 20 },
      { header: 'Nombre del Problema', key: 'name', width: 20 },
      { header: 'Modo de Falla', key: 'failureName', width: 20 },
      { header: 'Id Previo', key: 'previousID', width: 20 }
    ];

// 2. Agrega filas vacías manualmente (1 a la 5)
for (let i = 0; i <= 4; i++) {
  mainSheet.getRow(i).values = [];
}
mainSheet.mergeCells('A1:I1');
// Establecer un color de fondo a A1:K1
const headerRange = ['A1','B1','C1','D1','E1','F1','G1','H1','I1'];
headerRange.forEach(cellAddress => {
  const cell = mainSheet.getCell(cellAddress);
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE4E98B' }  // Fondo blanco
  };
  cell.border = {
  top: undefined,
  left: undefined,
  bottom: undefined,
  right: undefined
};
// Eliminar bordes
});

// Reducir altura de la fila 1
mainSheet.getRow(1).height = 8;

const whiteFill: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFFFFF' }
};

// Aplicar solo fondo blanco sin bordes al rango A2:I4
for (let row = 2; row <= 4; row++) {
  for (let col = 1; col <= 11; col++) {
    const cell = mainSheet.getCell(row, col);
    cell.fill = whiteFill;
  }

  for(let row = 1; row <= 4; row++){
    for (let col = 10; col <= 11; col++) {
    const cell = mainSheet.getCell(row, col);
    cell.fill = whiteFill;
  }
  } 
}

// Ahora las celdas con contenido
mainSheet.mergeCells('A2:I2');
const cellA2 = mainSheet.getCell('A2');
cellA2.value = 'Boletin de Calidad';
cellA2.font = { bold: true, size: 14 };
cellA2.alignment = { horizontal: 'left', vertical: 'justify' };

mainSheet.mergeCells('A3:C3');
const cellA3 = mainSheet.getCell('A3');
cellA3.value = 'Doc Number: RQ-F-009-004';
cellA3.font = { bold: true };
cellA3.alignment = { horizontal: 'left', vertical: 'middle' };

mainSheet.mergeCells('D3:F3');
const cellD3 = mainSheet.getCell('D3');
cellD3.value = 'Revision: 3';
cellD3.font = { bold: true };
cellD3.alignment = { horizontal: 'left', vertical: 'middle' };

mainSheet.mergeCells('G3:I3');
const cellG3 = mainSheet.getCell('G3');
cellG3.value = 'Issued: 03/27/2025';
cellG3.font = { bold: true };
cellG3.alignment = { horizontal: 'left', vertical: 'middle' };

mainSheet.mergeCells('A4:C4');
const cellA4 = mainSheet.getCell('A4');
cellA4.value = 'Approved By: Viviana Niño';
cellA4.font = { bold: true };
cellA4.alignment = { horizontal: 'left', vertical: 'middle' };

mainSheet.mergeCells('D4:F4');
const cellD4 = mainSheet.getCell('D4');
cellD4.value = 'Classification: Internal';
cellD4.font = { bold: true };
cellD4.alignment = { horizontal: 'left', vertical: 'middle' };

// Agregar imagen al lado derecho
const imageBuffer = await fetch('/assets/images/logo.png').then(res => res.arrayBuffer());
const imageId = workbook.addImage({
  buffer: imageBuffer,
  extension: 'png'
});


mainSheet.addImage(imageId, 'J2:K4');

// 3. Encabezado en la fila 6 (exactamente)
mainSheet.getRow(5).values = mainSheet.columns.map(col => col.header as ExcelJS.CellValue);





    // Hoja de detalles
    detailSheet.columns = [
      { header: 'Número de Boletín', key: 'bulletinID', width: 20 },
      { header: 'Descripción', key: 'description', width: 40 },
      { header: 'Acciones', key: 'action', width: 40 },
      { header: 'Retrabajo', key: 'reworkDetails', width: 40 }
    ];


    // === 3. AGREGAR FILAS ===
    for (const item of data) {
      let detalles = { description: '', action: '', reworkDetails: '' };

      try {
        const result = await this.provider.GetDetailsBy(item.bulletinID);
        detalles = {
          description: result?.description ?? '',
          action: result?.actions ?? '',
          reworkDetails: result?.reworkDetails ?? ''
        };
      } catch (err) {
        //console.warn(`No se pudo obtener detalles para el boletín ${item.bulletinID}`, err);
      }

      // Fila hoja principal
      mainSheet.addRow({
        bulletinID: item.bulletinID ?? '',
        impressions: item.impressions ?? '',
        area: item.area ?? '',
        partNumber: item.partNumber ?? '',
        startDate: item.startDate ? new Date(item.startDate).toLocaleDateString() : '',
        endDate: item.endDate ? new Date(item.endDate).toLocaleDateString() : '',
        customer: item.customer ?? '',
        supplier: item.supplier ?? '',
        name: item.name ?? '',
        failureName: item.failureName ?? '',
        previousID: item.previousID ?? ''
      });

      // Fila hoja detalles
      detailSheet.addRow({
        bulletinID: item.bulletinID ?? '',
        ...detalles
      });
    }

    // === 4. ESTILOS HOJA PRINCIPAL ===
    mainSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell(cell => {
        // Alineación personalizada según la fila
        if (rowNumber >= 5) {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true
          };
        } else if (rowNumber >= 2 && rowNumber <= 4) {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true
          };
        }

        // Bordes solo desde la fila 5 en adelante
        if (rowNumber >= 5) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        } else {
          cell.border = {
            top: undefined,
            left: undefined,
            bottom: undefined,
            right: undefined
          };
        }
      });

      // Encabezado fila 5
      if (rowNumber === 5) {
        row.eachCell(cell => {
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF6CFF00' }
          };
        });
      }
    });



    // === 5. ESTILOS HOJA DETALLES ===
    detailSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      if (rowNumber === 1) {
        row.eachCell(cell => {
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF6CFF00' }
          };
        });
      }
    });

    // Filtros
    mainSheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: 5, column: mainSheet.columns.length }
    };

    detailSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: detailSheet.columns.length }
    };

    // === 6. GUARDAR ARCHIVO ===
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    FileSaver.saveAs(blob, `${nombreArchivo}.xlsx`);
    this.notificationService.succes(`Se descargó ${nombreArchivo} correctamente`);
  });
  
}



  mostrarDetalle = false;
  bulletinID: string = '';
  selectedRow: any = null;

  detallesForm = this.fb.group({
    bulletinID: [''],
    description: [''],
    action: [''],
    reworkDetails: [''],
    qualityPhotos: [null],
    defectPhotos: [null]
  });
  async loadNonExpiredBulletins(): Promise<void> {
  try {
    const bulletinsNonExpired = await this.provider.GetAllBulletinsNonExpired();
    this.sourceTabVencidos.load(bulletinsNonExpired);
  } catch (error) {
    //console.error('Error cargando boletines no vencidos:', error);
    this.notificationService.error('No se pudieron cargar los boletines no vencidos');
  }
}

 async loadBoletinDetalle(bulletinID: string): Promise<void> {
  try {
    const data = await this.provider.GetDetailsBy(bulletinID);
    const additionalPhotos = await this.provider.GetBulletinPhotosBy(bulletinID);
    const detallesBoletin = Array.isArray(data) ? data : [];

    // Buscar en las tres fuentes posibles
    const [rowsActivos, rowsVencidos] = await Promise.all([
      this.sourceTab.getAll(),
      this.sourceTabVencidos.getAll()
    ]);

    const allRows = [...rowsActivos, ...rowsVencidos,];
    const selectedRow = allRows.find((item: any) => item.bulletinID === bulletinID);

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

      if (additionalPhotos && Array.isArray(additionalPhotos)) {
        additionalPhotos.forEach(photo => {
          if (photo.qualityPhotos && !patch.qualityPhotos.includes(photo.qualityPhotos)) {
            patch.qualityPhotos.push(photo.qualityPhotos);
          }
          if (photo.defectPhotos && !patch.defectPhotos.includes(photo.defectPhotos)) {
            patch.defectPhotos.push(photo.defectPhotos);
          }
        });
      }

      this.detallesForm.patchValue(patch);
      this.detallesForm.disable();
    }

    this.detallesSource.load(detallesBoletin);
    this.mostrarDetalle = true;
  } catch (error) {
    //console.error('Error al cargar detalle del boletín:', error);
    this.notificationService.error('No se pudo cargar el detalle del boletín');
  }
}


  cerrarFormulario(): void {
    this.mostrarDetalle = false;
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }





  updateProductionStatus(bulletinID: string, inProduction: boolean): void {
  if (!bulletinID) return;

  from(this.provider.updateBulletinInProduction(bulletinID, inProduction)).subscribe({
    next: async () => {
      this.notificationService.success(`Estatus de el Boletin ${bulletinID} actualizado correctamente`);

      const sources = [this.sourceTab, this.sourceTabVencidos];

      let foundItem: any = null;
      let sourceFound: LocalDataSource | null = null;

      // Buscar el boletín en todas las fuentes
      for (const source of sources) {
        const rows = await source.getAll();
        const match = rows.find((item: any) => item.bulletinID === bulletinID);
        if (match) {
          foundItem = match;
          sourceFound = source;
          break;
        }
      }

      if (foundItem && sourceFound) {
        // Eliminarlo de la fuente original
        await sourceFound.remove(foundItem);

        // Actualizar el estatus
        foundItem.inProduction = inProduction;

        // Determinar la tabla destino
        const today = new Date();
        //console.log('La fecha de hoy es:',today)
        const isExpired = new Date(foundItem.endDate) <= today;
        //console.log('Expirado:',isExpired)

        // Mover el ítem a la tabla correspondiente
        
          if (isExpired) {
            await this.sourceTabVencidos.add(foundItem);
          } else {
            await this.sourceTab.add(foundItem);
          }
        

        // Refrescar las tablas para que se vean los cambios inmediatamente
        await Promise.all([
          this.sourceTab.load(await this.sourceTab.getAll()),
          this.sourceTabVencidos.load(await this.sourceTabVencidos.getAll())
        ]);
      } else {
        this.notificationService.warning('No se encontró el boletín en las tablas');
      }
    },
    error: () => {
      this.notificationService.error('Error al actualizar el estatus');
    }
  });
  this.sourceTab.refresh
}


  

}
