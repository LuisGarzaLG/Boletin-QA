import { ChangeDetectorRef, Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { NotificationService } from 'src/app/providers/services/notification/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { qualityrequestsprovaider } from 'src/app/providers/services/quality request/qualityBrequestsprovaider';
import { CreateBulletinDto, Details2, FullBulletinDto, PhotoUploadDto } from 'src/app/providers/models/quality-request-all-models';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddComponent {
  nextBulletinId: string = '';
  bulletinform: FormGroup;
  detailsform: FormGroup;
  fullbulletininform: FormGroup;
  searchForm: FormGroup;
  photoupload: FormGroup;
  isSearching: boolean = false;
  isLoading: boolean = false;

  @ViewChild('bulletinIDInput') bulletinIDInput!: ElementRef;
  @ViewChild('qualityPhotoInput') qualityPhotoInput!: ElementRef;
  @ViewChild('defectPhotoInput') defectPhotoInput!: ElementRef;
  @ViewChild('qualityPhotoInput1') qualityPhotoInput1!: ElementRef;
  @ViewChild('defectPhotoInput1') defectPhotoInput1!: ElementRef;

  qualityPhotosBase64: string | null = null;
  defectPhotosBase64: string | null = null;
  qualityPhotosBase641: string | null = null;
  defectPhotosBase641: string | null = null;
  imagePreviews: any = { qualityPhotos: '', defectPhotos: '' };
  areas: string[] = ['F-AX1', 'F-AX2', 'F-AX3', 'F-AX4', 'BPA-1', 'BPA-2', 'BPA-3', 'Reflash', 'Network', 'S4X', 'COE', 'SRL', 'LCS', 'Incoming', 'PSC', 'Residencial', 'o	C&I', 'Residencial - C&I', 'Embarques'];
  selectedArea: string = '';

  constructor(
    private fb: FormBuilder,
    private provider: qualityrequestsprovaider,
    private notificationservice: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.bulletinform = this.fb.group({
      bulletinID: [''],
      area: ['', Validators.required],
      partNumber: [''],
      startDate: [''],
      endDate: [''],
      customer: [''],
      supplier: [''],
      name: [''],
      failureName: [''],
      previousID: [null],
      creatorUser: [''],
      creatorName: [''],
      impressions: [1, [Validators.required, Validators.min(1)]],
      inProduction: false
    });

    this.detailsform = this.fb.group({
      bulletinID: [''],
      description: [null],
      actions: [null],
      reworkDetails: [null]
    });

    this.fullbulletininform = this.fb.group({
      bulletin: [''],
      details: [''],
      qualityPhotos: [],
      defectPhotos: []
    });

    this.photoupload = this.fb.group({
      id: [''],
      bulletinID: [''],
      qualityPhotos: [],
      defectPhotos: []
    });

    this.searchForm = this.fb.group({
      bulletinID: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    const currentUsers = sessionStorage.getItem('currentUser');
    if (currentUsers) {
      const creatorUser = JSON.parse(currentUsers);
      const name = creatorUser.name;
      this.bulletinform.patchValue({ creatorUser: name });
    }
    if (currentUsers) {
      const creatorName = JSON.parse(currentUsers);
      const name = creatorName.givenName;
      this.bulletinform.patchValue({ creatorName: name });
    }
   
  }


  // --- EL RESTO DE TU CÓDIGO ---

  onSelectChange(): void {
    // Puedes agregar lógica si cambias el área
  }

  async onSubmit(): Promise<void> {
    if (!this.bulletinform.valid || !this.detailsform.valid || !this.photoupload.valid) {
      this.notificationservice.warning('Por favor, llena todos los campos requeridos');
      return;
    }
    const detailsData = this.detailsform.value;
try {
  this.nextBulletinId = await this.provider.GetNextBulletinId();
    //console.log('Valor recibido en componente:', this.nextBulletinId);
    this.bulletinform.patchValue({ bulletinID: this.nextBulletinId });
}catch{
  this.notificationservice.warning('vasd')
  return
  
}
      

    if (!detailsData.description) {
      this.notificationservice.warning('La descripción es requerida');
      return;
    }
    if (!detailsData.actions) {
      this.notificationservice.warning('Las acciones son requeridas');
      return;
    }

    let email = '';
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      email = user.email;
    }

    const bulletinphotosData = this.photoupload.value;

    const formData = this.bulletinform.value;
    const bulletin: CreateBulletinDto = {
      bulletinID: formData.bulletinID,
      area: formData.area,
      failureName: formData.failureName,
      name: formData.name,
      startDate: this.formatDate(formData.startDate),
      endDate: this.formatDate(formData.endDate),
      customer: formData.customer,
      supplier: formData.supplier,
      partNumber: formData.partNumber,
      previousID: formData.previousID,
      creatorUser: formData.creatorUser, 
      creatorName: formData.creatorName,
      impressions: formData.impressions,
      inProduction: formData.inProduction
    };
    const details: Details2 = {
      bulletinID: formData.bulletinID,
      description: detailsData.description,
      actions: detailsData.actions,
      reworkDetails: detailsData.reworkDetails
    };
    const fullBulletin: FullBulletinDto = {
      bulletin,
      details,
      emailCreator: email,
      qualityPhotos: this.qualityPhotosBase64,
      defectPhotos: this.defectPhotosBase64
    };
    const photoupload: PhotoUploadDto = {
      id: 0,
      bulletinID: this.nextBulletinId,
      qualityPhotos: this.qualityPhotosBase641,
      defectPhotos: this.defectPhotosBase641
    };

    //console.log(fullBulletin);
    //console.log(photoupload);

    const result = await Swal.fire({
      title: '¿Quieres crear el Boletín?',
      text: 'Se registrará el boletín en la base de datos',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      confirmButtonColor: '#598bff',
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#3b4355',
      background: '#333',
      color: '#fff',
      customClass: {
        title: 'custom-toast-title',
        popup: 'swal2-borderless'
      }
    });

    if (result.isConfirmed) {
      try {
        await this.provider.FullBulletin(fullBulletin);
        await this.provider.createPhotos(photoupload);

        this.bulletinform.reset({
          creatorUser: this.bulletinform.get('creatorUser')?.value,
          creatorName: this.bulletinform.get('creatorName')?.value
        });
        this.detailsform.reset();
        this.qualityPhotosBase64 = null;
        this.defectPhotosBase64 = null;
        this.imagePreviews.qualityPhotos = '';
        this.imagePreviews.defectPhotos = '';
        this.imagePreviews.qualityPhotos1 = '';
        this.imagePreviews.defectPhotos1 = '';
        this.resetInput(this.qualityPhotoInput);
        this.resetInput(this.defectPhotoInput);
        this.resetInput(this.qualityPhotoInput1);
        this.resetInput(this.defectPhotoInput1);
        this.provider.refreshdata();
        this.notificationservice.success('Boletín creado exitosamente.');
        this.provider.refreshdata();

        // Luego de guardar, actualizamos el ID automático para el siguiente boletín
        

      } catch (error: any) {
        //console.error('Error al crear el boletín', error);
        this.notificationservice.error('Error al crear el boletín');
      }
    } else {
      this.notificationservice.info('Modifica la información si es necesario.');
    }
  }

  resetInput(inputRef: ElementRef | undefined): void {
    if (inputRef) {
      inputRef.nativeElement.value = '';
    }
  }

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return '';
    }
    return parsedDate.toISOString();
  }

  onImageSelected(event: Event, imageType: 'qualityPhotos' | 'defectPhotos'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        if (imageType === 'qualityPhotos') {
          this.qualityPhotosBase64 = base64String.split(',')[1];
          this.imagePreviews.qualityPhotos = base64String;
        } else if (imageType === 'defectPhotos') {
          this.defectPhotosBase64 = base64String.split(',')[1];
          this.imagePreviews.defectPhotos = base64String;
        }
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onMoreImage(event: Event, imageType: 'qualityPhotos1' | 'defectPhotos1'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        if (imageType === 'qualityPhotos1') {
          this.qualityPhotosBase641 = base64String.split(',')[1];
          this.imagePreviews.qualityPhotos1 = base64String;
        } else if (imageType === 'defectPhotos1') {
          this.defectPhotosBase641 = base64String.split(',')[1];
          this.imagePreviews.defectPhotos1 = base64String;
        }
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  submitAdditionalPhotos() {
    const bulletinID = this.photoupload.get('bulletinID')?.value;

    if (!bulletinID || bulletinID.trim() === '') {
      this.notificationservice.warning('Debes ingresar un Número de Boletín válido.');
      return;
    }

    if (!this.qualityPhotosBase641 && !this.defectPhotosBase641) {
      this.notificationservice.warning('Debes subir al menos una foto adicional.');
      return;
    }

    const additionalPhotos: PhotoUploadDto = {
      id: 0,
      bulletinID,
      qualityPhotos: this.qualityPhotosBase641,
      defectPhotos: this.defectPhotosBase641
    };

    this.provider.createPhotos(additionalPhotos).then(() => {
      this.notificationservice.success('Fotos adicionales enviadas correctamente.');
      this.photoupload.reset();
      this.resetInput(this.qualityPhotoInput1);
      this.resetInput(this.defectPhotoInput1);
      this.imagePreviews.qualityPhotos1 = '';
      this.imagePreviews.defectPhotos1 = '';
    }).catch((error) => {
      this.notificationservice.error('Error al enviar fotos adicionales.');
      //console.error(error);
    });
  }
}
