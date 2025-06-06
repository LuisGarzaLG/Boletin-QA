import { AfterViewInit, Component, ElementRef, ViewChild, OnInit , Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { qualityrequestsprovaider } from 'src/app/providers/services/quality request/qualityBrequestsprovaider';
import { NotificationService } from 'src/app/providers/services/notification/notification.service';
import { CreateBulletinDto, Details, PhotoUploadDto,Employee, CreateTrainingDto} from 'src/app/providers/models/quality-request-all-models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';



@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {
zoom = 0.60;
transform = '';
isDragging = false;
lastX = 0;
lastY = 0;
translateX = 0;
translateY = 0;

ngAfterViewInit() {
  this.updateTransform();
}

onWheel(event: WheelEvent): void {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  this.zoom += delta;
  this.zoom = Math.min(Math.max(this.zoom, 0.6), 3);

  // Si el zoom está en el mínimo, resetear el translate para centrar
  if (this.zoom <= 0.6) {
    this.translateX = 0;
    this.translateY = 0;
  }

  this.updateTransform();
}


startDragging(event: MouseEvent): void {
  this.isDragging = true;
  this.lastX = event.clientX;
  this.lastY = event.clientY;
}

onDragging(event: MouseEvent): void {
  if (!this.isDragging) return;

  const dx = event.clientX - this.lastX;
  const dy = event.clientY - this.lastY;

  this.lastX = event.clientX;
  this.lastY = event.clientY;

  this.translateX += dx;
  this.translateY += dy;

  this.updateTransform();
}

stopDragging(): void {
  this.isDragging = false;
}

updateTransform(): void {
  this.transform = `scale(${this.zoom}) translate(${this.translateX / this.zoom}px, ${this.translateY / this.zoom}px)`;
}


  employeeData: Employee | null = null;


  TrainingQA = {
  columns: {
    id: {
      title: 'ID',
    },
    bulletinId: {
      title: 'Bulletin ID',
    },
    employeeNumber: {
      title: 'Employee Number',
    },
    fullName: {
      title: 'Employee Name',
    },
    lastDate: {
      title: 'Date',
    }
  },
  actions: { add: false, edit: false, delete: false },
  noDataMessage: 'No hay entrenamientos registrados.'
};

// Aquí guardaremos los datos que van a la tabla
trainingData: any[] = [];


  sourceTab = new LocalDataSource();

  trainingForm!: FormGroup;
  selectedForm: string = '';
  showTemplateWarning = false;
  fullform: FormGroup;
  bulletinData: CreateBulletinDto | null = null;
  detailsData: Details | null = null;
  searchBulletinId: string = '';
  qualityPhotosBase64: string | null = null;
  defectPhotosBase64: string | null = null;
  qualityPhotosBase641: string | null = null;
  defectPhotosBase641: string | null = null;



  constructor(
    private fb: FormBuilder,
    private provider: qualityrequestsprovaider,
    private notificationService: NotificationService,
    private renderer: Renderer2
  ) {
    this.fullform = this.fb.group({
      bulletinform: this.fb.group({
        bulletinID: ['', Validators.required],
        area: [''],
        partNumber: [''],
        startDate: [''],
        name: [''],
        endDate: [''],
        previousID: [''],
        dated: [''],
        failureMode: [''],
        supplier:[''],
        customer:[''],
        creatorUser: [''], 
        creatorName:[''],
        impressions: [1, [Validators.required, Validators.min(1)]],
        inProduction:['']
      }),
      detailsform: this.fb.group({
        bulletinID: [''],
        description: ['', Validators.required],
        actions: ['', Validators.required],
        reworkDetails: [''],
        photos: ['']
      })
    });
  }

  get bulletinform(): FormGroup {
    return this.fullform.get('bulletinform') as FormGroup;
  }
  
  get detailsform(): FormGroup {
    return this.fullform.get('detailsform') as FormGroup;
  }
private bulletinInput$ = new Subject<string>();


ngOnInit(): void {
  this.trainingForm = this.fb.group({
  empNumber: ['', Validators.required],
  employeeName: [{ value: '', disabled: true }], 
  area: [{ value: '', disabled: true }],
  supervisor: [{ value: '', disabled: true }],
  shift: [{ value: '', disabled: true }],
  bulletinID: ['', Validators.required],
  date: ['', Validators.required],
});
  // Búsqueda automática al escribir el nombre del entrenamiento
  this.bulletinInput$
  .pipe(debounceTime(700), distinctUntilChanged())
  .subscribe(value => {
    if (value.length > 2) {
      this.bulletinform.get('bulletinID')?.setValue(value);
      this.buscarEntrenamiento();
      this.onSearchBoth();
    }
  });
  

this.trainingForm.get('bulletinID')?.valueChanges.subscribe(value => {
  this.bulletinInput$.next(value);
});


    this.trainingForm.get('empNumber')?.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(async value => {
        const empNumber = parseInt(value, 10);
        if (!isNaN(empNumber)) {
          await this.buscarEmpleado(empNumber);
        }
      });
    }


async onSearchTrainingByBulletin(): Promise<void> {
  if (this.searchBulletinId && this.searchBulletinId.length >= 8) {
    try {
      const trainings = await this.provider.GetEmployeeTrainingByBulletinId(this.searchBulletinId);
      
      // Mostrar boletín en vista previa (como si fuera búsqueda directa)
      const bulletin = await this.provider.GetBulletinBy(this.searchBulletinId);
      this.bulletinData = bulletin; // Esto es lo que activa la vista previa en tu HTML

      if (trainings && trainings.length > 0) {
        this.trainingData = trainings.map(training => ({
          ...training,
          lastDate: training.lastDate?.split('T')[0] || ''
        }));
        this.sourceTab.load(this.trainingData);
      } else {
        this.trainingData = [];
        this.sourceTab.load(this.trainingData);
        this.notificationService.info('Sin resultados', 'No se encontraron entrenamientos para este boletín.');
      }
    } catch (error) {
      console.error('Error en búsqueda de entrenamientos:', error);
      this.notificationService.error('Error', 'Ocurrió un error al buscar entrenamientos.');
    }
  }
}






async buscarEmpleado(empNumber: number): Promise<void> {
  try {
    const employee = await this.provider.getEmployeeByNumber(empNumber);
    if (employee) {
      this.employeeData = employee;
      this.selectedEmployee = {
        employeeNumber: employee.employeeNumber, // o employee.id según tu modelo
        name: employee.name,
      };

      // Rellenar campos
      this.trainingForm.patchValue({
        employeeName: employee.name || '',
        area: employee.area || '',
        supervisor: employee.supervisor || '',
        shift: employee.shift || '',
      });
    } else {
      this.employeeData = null;
      this.selectedEmployee = null; // limpiar selección si no se encontró
      this.trainingForm.patchValue({
        employeeName: '',
        area: '',
        supervisor: '',
        shift: '',
      });
      this.notificationService.info('No encontrado', 'No se encontró un empleado con ese ID.');
    }
  } catch (error) {
    console.error('Error al buscar empleado:', error);
    this.notificationService.error('Error', 'Hubo un error al consultar el empleado.');
  }
}




 selectedEmployee: { employeeNumber: number; name: string } | null = null;

  // Cuando cargas el empleado:
  onEmployeeFound(empleadoEncontrado: any) {
    this.selectedEmployee = {
      employeeNumber: empleadoEncontrado.employeeNumber,
      name: empleadoEncontrado.name,
    };
  }

  async onSubmit() {
  if (!this.selectedEmployee) {
    this.notificationService.warning('No se ha seleccionado empleado');
    return;
  }

  try {
    const trainingPayload = [{
      id: 0,
      bulletinId: this.bulletinform.value.bulletinID || this.bulletinform.value.bulletinId,
      employeeNumber: Number(this.selectedEmployee.employeeNumber),
      fullName: this.selectedEmployee.name,
      lastDate: new Date().toISOString(),
    }];

    //console.log('Payload para crear training:', trainingPayload);

    await this.provider.CreateTraining(trainingPayload);

    this.notificationService.info('Training creado con éxito');

    // Limpiar formulario y datos asociados después de guardar
    this.trainingForm.reset();
    this.selectedEmployee = null;
    this.employeeData = null;

    // Opcional: deshabilitar los campos que estaban deshabilitados
    this.trainingForm.get('employeeName')?.disable();
    this.trainingForm.get('area')?.disable();
    this.trainingForm.get('supervisor')?.disable();
    this.trainingForm.get('shift')?.disable();

  } catch (error) {
    this.notificationService.warning('Error al crear training');
    console.error(error);
  }
}

  selectForm(form: string): void {
    this.selectedForm = form;  // Actualiza la plantilla seleccionada SOLO aquí
    this.showTemplateWarning = false;
  }

  async onSearchBoth(): Promise<void> {
  const bulletinID = this.bulletinform.get('bulletinID')?.value;
  if (bulletinID) {
    try {
      const BulletinData: CreateBulletinDto | null = await this.provider.GetBulletinBy(bulletinID);
      if (!BulletinData) {
        // Si no existe boletín, limpiar datos y mostrar warning
        this.bulletinData = null;
        this.detailsData = null;
        this.selectedForm = '';
        this.qualityPhotosBase64 = null;
        this.defectPhotosBase64 = null;
        this.qualityPhotosBase641 = null;
        this.defectPhotosBase641 = null;
        await this.notificationService.warning('Boletín inválido', 'Por favor, ingrese un boletín correcto.');
        return; // Salir sin hacer nada más
      }

      // Si sí existe boletín, asignar datos y seguir lógica
      this.bulletinData = BulletinData;
      //console.log('Datos del boletín recibidos:', BulletinData);

      this.bulletinform.patchValue({
        bulletinID: BulletinData.bulletinID,
        area: BulletinData.area,
        startDate: this.formatDate(BulletinData.startDate),
        name: BulletinData.name,
        endDate: this.formatDate(BulletinData.endDate),
        previousID: BulletinData.previousID,
        dated: new Date().toISOString().split('T')[0],
        failureMode: BulletinData.failureName,
        supplier: BulletinData.supplier,
        customer: BulletinData.customer,
        partNumber: BulletinData.partNumber,
      });

      // Cargar detalles
      const DetailsData: Details | null = await this.provider.GetDetailsBy(bulletinID);
      if (DetailsData) {
        this.detailsData = DetailsData;
        //console.log('Datos de detalles:', DetailsData);

        this.detailsform.patchValue({
          bulletinID: DetailsData.bulletinID,
          description: `<strong>DESCRIPCION DEL PROBLEMA:</strong> ${DetailsData.description}`,
          actions: ` <strong>NOTIFICACION AL PERSONAL DE PRODUCCION:</strong>${DetailsData.actions}`,
          reworkDetails: DetailsData.reworkDetails,
        });

        const photos = DetailsData?.photos;
        if (photos) {
          this.qualityPhotosBase64 = photos.qualityPhotos ? `data:image/jpeg;base64,${photos.qualityPhotos}` : null;
          this.defectPhotosBase64 = photos.defectPhotos ? `data:image/jpeg;base64,${photos.defectPhotos}` : null;
        }
      } else {
        this.detailsData = null;
        await this.notificationService.info('Detalles no encontrados', 'No se encontraron detalles asociados al boletín.');
        return;
      }

      // Cargar fotos adicionales
      const MP: PhotoUploadDto[] | null = await this.provider.GetBulletinPhotosBy(bulletinID);
      if (MP && MP.length > 0) {
        let firstPhoto: PhotoUploadDto | undefined;

        for (let i = 1; i < MP.length; i++) {
          if ((MP[i].qualityPhotos && MP[i].qualityPhotos !== "") || 
              (MP[i].defectPhotos && MP[i].defectPhotos !== "")) {
            firstPhoto = MP[i];
            break;
          }
        }

        if (firstPhoto) {
          this.qualityPhotosBase641 = firstPhoto.qualityPhotos ? `data:image/jpeg;base64,${firstPhoto.qualityPhotos}` : null;
          this.defectPhotosBase641 = firstPhoto.defectPhotos ? `data:image/jpeg;base64,${firstPhoto.defectPhotos}` : null;
        }
      }

      // Decidir qué formulario mostrar según número de fotos
      let totalPhotos = 0;
      if (this.qualityPhotosBase64) totalPhotos++;
      if (this.defectPhotosBase64) totalPhotos++;
      if (this.qualityPhotosBase641) totalPhotos++;
      if (this.defectPhotosBase641) totalPhotos++;

      if (!this.selectedForm) { // Solo si no fue ya definido
        if (totalPhotos <= 2) {
          this.selectedForm = 'form1';
        } else if (totalPhotos > 3) {
          this.selectedForm = 'form2';
        } else {
          this.selectedForm = ''; // No mostrar formulario si fotos no cumplen condición
        }
      }

    } catch (error) {
      console.error('Error al obtener los datos del boletín o detalles:', error);
      await this.notificationService.info('Error al obtener los datos', 'Hubo un problema al obtener los datos o detalles del boletín.');
    }
  } else {
    await this.notificationService.warning('Número de boletín inválido', 'Por favor, ingrese un número de boletín válido.');
  }
}

  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }


async buscarEntrenamiento(): Promise<void> {
  // Aquí decides si quieres buscar por bulletinID o por search, o por ambos
  // Para que sea coherente, tomemos primero search si tiene valor, si no bulletinID
  const searchValue = this.trainingForm.get('search')?.value?.trim();
  const bulletinID = this.trainingForm.get('bulletinID')?.value?.trim();

  const idToSearch = searchValue || bulletinID;
  if (!idToSearch) return;

  try {
    const bulletinData: CreateBulletinDto | null = await this.provider.GetBulletinBy(idToSearch);
    if (!bulletinData) {
      // Limpia vista previa si no encontró nada
      this.limpiarVistaPrevia();
      return;
    }

    this.qualityPhotosBase64 = null;
    this.defectPhotosBase64 = null;
    this.qualityPhotosBase641 = null;
    this.defectPhotosBase641 = null;

    this.bulletinform.patchValue({
      bulletinID: bulletinData.bulletinID,
      area: bulletinData.area,
      startDate: this.formatDate(bulletinData.startDate),
      name: bulletinData.name,
      endDate: this.formatDate(bulletinData.endDate),
      previousID: bulletinData.previousID,
      dated: new Date().toISOString().split('T')[0],
      failureMode: bulletinData.failureName,
      supplier: bulletinData.supplier,
      customer: bulletinData.customer,
      partNumber: bulletinData.partNumber,
      creatorUser: bulletinData.creatorUser,
      creatorName: bulletinData.creatorName,
      impressions: bulletinData.impressions,
      inProduction: bulletinData.inProduction,
    });

    const lowerName = idToSearch.toLowerCase();
    if (lowerName.includes('modelo1') || lowerName.includes('form1')) {
      this.selectedForm = 'form1';
    } else if (lowerName.includes('modelo2') || lowerName.includes('form2')) {
      this.selectedForm = 'form2';
    } else {
      this.selectedForm = '';
    }

    await this.onSearchBoth();

  } catch (error) {
    console.error(error);
    await this.notificationService.info('Error', 'Ocurrió un error al buscar el entrenamiento.');
  }
}

limpiarVistaPrevia() {
  this.bulletinform.reset();
  this.qualityPhotosBase64 = null;
  this.defectPhotosBase64 = null;
  this.qualityPhotosBase641 = null;
  this.defectPhotosBase641 = null;
  this.selectedForm = '';
}
}
