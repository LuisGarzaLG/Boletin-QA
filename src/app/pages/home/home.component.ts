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
    //console.log(currentUsers);

    if (currentUser) {
      const user = JSON.parse(currentUser);
      const email = user.email;
      const name = user.name; // Cambia `givenName` por `name` si prefieres otro campo
      //console.log('Name:', name); // Muestra el nombre en consola
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
    console.error('Error cargando datos:', error);
    this.notificationService.error('No se pudieron cargar los datos de boletines');
  } finally {
    this.loading = false;
  }
}


 exportToExcel(source: LocalDataSource, nombreArchivo: string): void {
  source.getFilteredAndSorted().then(data => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bulletin QA');

    worksheet.columns = [
      { header: 'Número de Boletín', key: 'bulletinID', width: 20 },
      { header: 'Impresiones', key: 'impressions', width: 20 },
      { header: 'Area', key: 'area', width: 20 },
      { header: 'Número de Parte', key: 'partNumber', width: 20 },
      { header: 'Fecha', key: 'startDate', width: 20 },
      { header: 'Fecha de Vencimiento', key: 'endDate', width: 20 },
      { header: 'Cliente', key: 'customer', width: 20 },
      { header: 'Proveedor', key: 'supplier', width: 20 },
      { header: 'Nombre del Problema', key: 'name', width: 20 },
      { header: 'Modo de Falla', key: 'failureName', width: 20 },
      { header: 'Id Previo', key: 'previousID', width: 20 },
      { header: 'Usuario', key: 'creatorName', width: 20 },
      { header: 'Estatus', key: 'inProduction', width: 15 },
    ];

    data.forEach((item: any) => {
      worksheet.addRow({
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
        previousID: item.previousID ?? '',
        creatorName: item.creatorName ?? '',
        inProduction: item.inProduction ? 'Retirado' : 'Activo'
      });
    });

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      if (rowNumber === 1) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
          };
        });
      }
    });

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns.length }
    };

    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      FileSaver.saveAs(blob, `${nombreArchivo}.xlsx`);
      this.notificationService.succes(`Se descargó ${nombreArchivo} correctamente`);
      });
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
    console.error('Error cargando boletines no vencidos:', error);
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
    console.error('Error al cargar detalle del boletín:', error);
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
        console.log('La fecha de hoy es:',today)
        const isExpired = new Date(foundItem.endDate) <= today;
        console.log('Expirado:',isExpired)

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
