import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/providers/services/notification/notification.service';
import { qualityrequestsprovaider } from 'src/app/providers/services/quality request/qualityBrequestsprovaider';
import { CreateBulletinDto, Details, FullBulletinDto, PhotoUploadDto } from 'src/app/providers/models/quality-request-all-models';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {
  selectedForm: string = '';
  fullform: FormGroup;
  bulletinData: CreateBulletinDto | null = null;
  detailsData: Details | null = null;  // Mantener como Details | null
  fullData: FullBulletinDto | null = null;
  uploadphotos!: FormGroup;


  // Propiedades para las fotos
  qualityPhotosBase64: string | null = null;
  defectPhotosBase64: string | null = null;
  qualityPhotosBase641: string | null = null;
  defectPhotosBase641: string | null = null;

  maxPrints: number = 0;  // Número máximo de impresiones
  currentPrints: number = 0;  // Contador de impresiones realizadas



  get bulletinform(): FormGroup {
    return this.fullform.get('bulletinform') as FormGroup;
  }
  
  get detailsform(): FormGroup {
    return this.fullform.get('detailsform') as FormGroup;
  }

  
  showTemplateWarning = false;

selectForm(form: string): void {
  this.selectedForm = form;  // Actualiza la plantilla seleccionada

  // Si se seleccionó un boletín, quitamos la advertencia
  this.showTemplateWarning = false;
}

onBulletinIdInput(): void {
  const inputValue = this.bulletinform.get('bulletinID')?.value;

  // Si escribe algo y no hay boletín seleccionado, mostrar advertencia
  this.showTemplateWarning = !!inputValue && !this.selectedForm;
}


  

  constructor(
    private fb: FormBuilder,
    private provider: qualityrequestsprovaider,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
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

  ngOnInit(): void {
     this.maxPrints = this.bulletinform.get('impressions')?.value || 0;
  }

  // Función para buscar boletín y detalles
  async onSearchBoth(): Promise<void> {
    const bulletinID = this.bulletinform.get('bulletinID')?.value;
    if (bulletinID) {
      try {
        // Obtener datos del boletín
        const BulletinData: CreateBulletinDto | null = await this.provider.GetBulletinBy(bulletinID);
        if (BulletinData) {
          this.bulletinData = BulletinData;
          console.log('Datos del boletín recibidos:', BulletinData);
  
          // Asignar valores al formulario
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
            //creatorUser: BulletinData.creatorUser, 
            //creatorName:BulletinData.creatorName,
            //impressions: BulletinData.impressions,
            //inProduction: BulletinData.inProduction
          });
        } else {
          await this.notificationService.info('Boletín no encontrado', 'Por favor, ingrese un boletín válido.');
          return;
        }
  
        // Obtener detalles del boletín
        const DetailsData: Details | null = await this.provider.GetDetailsBy(bulletinID);
        if (DetailsData) {
          this.detailsData = DetailsData;
          console.log('Datos de detalles:', DetailsData);
  
          // Actualizar el formulario con los detalles
          this.detailsform.patchValue({
            bulletinID: DetailsData.bulletinID,
            description: `<strong>DESCRIPCION DEL PROBLEMA:</strong> ${DetailsData.description}`,
            actions: ` <strong>NOTIFICACION AL PERSONAL DE PRODUCCION:</strong>${DetailsData.actions}`,
            reworkDetails: DetailsData.reworkDetails,
          });
          
  
          // Aquí asignamos las fotos automáticamente si existen
          const photos = DetailsData?.photos;
          if (photos) {
            console.log("Fotos recibidas:", photos);  // Depuración
            if (photos.qualityPhotos) {
              this.qualityPhotosBase64 = `data:image/jpeg;base64,${photos.qualityPhotos}`;
              console.log("Foto de calidad:", this.qualityPhotosBase64);  // Verifica la foto
            }
  
            if (photos.defectPhotos) {
              this.defectPhotosBase64 = `data:image/jpeg;base64,${photos.defectPhotos}`;
              console.log("Foto de defecto:", this.defectPhotosBase64);  // Verifica la foto
            }
          }
        } else {
          await this.notificationService.info('Detalles no encontrados', 'No se encontraron detalles asociados al boletín.');
          return;
        }
  
        // Obtener las fotos del boletín
const MP: PhotoUploadDto[] | null = await this.provider.GetBulletinPhotosBy(bulletinID);
if (MP && MP.length > 0) {
  let firstPhoto: PhotoUploadDto | undefined;

  for (let i = 1; i < MP.length; i++) {  // Inicia la búsqueda desde el índice 1
    // Verificar si qualityPhotos o defectPhotos no son null ni ""
    if ((MP[i].qualityPhotos && MP[i].qualityPhotos !== "") || 
        (MP[i].defectPhotos && MP[i].defectPhotos !== "")) {
      firstPhoto = MP[i];
      break;  // Si encontramos una foto válida, salimos del bucle
    }
  }

  if (firstPhoto) {
    if (firstPhoto.qualityPhotos) {
      this.qualityPhotosBase641 = `data:image/jpeg;base64,${firstPhoto.qualityPhotos}`;
      console.log("Foto calidad MP:", this.qualityPhotosBase641);
    }
    if (firstPhoto.defectPhotos) {
      this.defectPhotosBase641 = `data:image/jpeg;base64,${firstPhoto.defectPhotos}`;
      console.log("Foto defecto MP:", this.defectPhotosBase641);
    }
  } else {
    console.log("No se encontró ninguna foto válida en los datos recibidos");
  }
} else {
  console.log("No hay fotos adicionales disponibles");
}

      } catch (error) {
        console.error('Error al obtener los datos del boletín o detalles:', error);
        await this.notificationService.info('Error al obtener los datos', 'Hubo un problema al obtener los datos o detalles del boletín.');
      }
    } else {
      await this.notificationService.info('Número de boletín inválido', 'Por favor, ingrese un número de boletín válido.');
    }
  }
  


  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  

  // Función para imprimir el formulario
  printMainForm() {
  if (!this.bulletinData) {
    this.notificationService.error('No hay boletín cargado para imprimir.');
    return;
  }

  const maxImpressions = this.bulletinData.impressions || 0;
  const currentPrintCount = this.currentPrints || 0; // Aquí puedes manejar el contador local o global

  if (currentPrintCount >= maxImpressions) {
    this.notificationService.eror(`El boletín ${this.bulletinData.bulletinID} ya alcanzó el límite máximo de impresiones (${maxImpressions}).`);
    return; // Bloquea impresión
  }

  // Aquí continúa el código de impresión original...
  const content = document.getElementById('formularioPrincipal');
  const printWindow = window.open('', '', 'width=816,height=1056');

  if (printWindow && content) {
    const updatedContent = content.cloneNode(true) as HTMLElement;

    const inputsAndTextareas = updatedContent.querySelectorAll('input, textarea');
    inputsAndTextareas.forEach((element: Element) => {
      if (element instanceof HTMLTextAreaElement) {
        element.innerText = element.value;
        element.style.background = 'none';
        element.style.border = 'none';
        element.style.overflow = 'visible';
        element.style.resize = 'none';
        element.style.height = 'auto';
      } else if (element instanceof HTMLInputElement) {
        element.setAttribute('value', element.value);
        element.setAttribute('disabled', 'true');
      }
    });

    const imageElement = updatedContent.querySelector('.encabezado-img') as HTMLImageElement;
      if (imageElement) {

        const updatedContent = content.cloneNode(true) as HTMLElement;
        const imageElement = updatedContent.querySelector('.encabezado-img') as HTMLImageElement;
        if (imageElement) {
          imageElement.src = '${location.origin}/assets/images/Encabezado.png';
        }
      }
  //#region styles
  let styles = '';
  switch (this.selectedForm) {
    case 'form1':
      styles = 
      `/* TÍTULO */
h2 {
  margin-top: 0;
    font-size: 40px;
    color: red;
    text-align: center;
    text-decoration: underline;
    margin-bottom: 5px;
  }
  
  .photo {
    max-width: 100%;
    height: 80px;
    object-fit: contain;
  }
  
  .column {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
  }

  
  label {
    margin-bottom: 0px;
  }
  
  /* INPUTS GENERALES */
  input {
    width: 100%;
    margin-bottom: 0.5rem;
    padding: 0.4rem;
    box-sizing: border-box;
    pointer-events: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  input:hover {
    border: 1px solid #007bff;
    background-color: #f8f8f8;
  }
  
  input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px #007bff;
    outline: none;
  }
  
  /* INPUTS INVÁLIDOS */
  input.ng-invalid.ng-touched  {
    border: 1px solid red;
    background-color: #ffffff;
  }
  
  /* ESPECÍFICOS */
  .form-control {
    border-color: transparent;
    height: fit-content;
    color: #000;
    margin: 0;
    font-family: sans-serif !important;
    font-size: 18px;
    align-items: center;
    
  }
  
  .form-control1 {
    text-align: center;
    background-color: yellow;
    font-family: sans-serif !important;
    font-weight: bold;
    font-size: 20px;
    height: 28px;
    border: 1px solid #000;
  }
  
  .form-control,
  .form-control1 {
    white-space: normal;       /* Permite que el texto se ajuste en varias líneas si es necesario */
    overflow-wrap: none; /* Rompe las palabras largas */
    word-break: break-word;    /* Corta las palabras muy largas si es necesario */
  }
  /* CONTENEDORES */
  .input-container-m1{
    display: flex;
  }
  
  .input-container-m1 label {
    font-size: 16px;
    min-width: max-content;
    font-weight: bold;
  }
  
  .input-container-m1 input{
    flex-grow: 0;
    font-size: 16px;
    padding: 0 0 0 10px;
    color: #000 !important;
  }
  
  .input-container-m1 textarea{
    flex-grow: 1;
    font-size: 14px;
    padding: 0 0 0 5px;
    color: #000 !important;
    min-width: max-content;
    overflow: hidden;
    resize: none;
  }

  .asd1{
    padding: 0 5px;
    text-align: justify;
    min-height: 60px;
  }

  /* SECCIONES */
  .info-section {
    background-color: #ffffff;
    display: flex;
    color: black;
    border: solid 1px black;
    padding-left: 5px;
    transition: all 0.3s ease;
    margin-bottom: 10px;
  }
  
  .left, .right {
    flex: 1;
    margin-right: 1rem;
  }
  
  .right {
    margin-right: 0;
  }
  
  .columns {
    display: flex;
    align-items: center; /* Asegura que todas las columnas tengan la misma altura */
    gap: 10px; /* Espacio entre columnas */
  }
  
  .column {
    position: relative;
    flex: 1;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: end;
    border-radius: 15px;
    border: 1px solid #000;
    height: 380px;
  }
  .accept,
  .defects {
    position: absolute;
    top: 5px;
    left: 5px;
    padding: 5px 10px;
    font-weight: bold;
    border-radius: 10px;
    color: #000;
  }
  
  .accept {
    background-color: #00ff0d;
  }
  
  .defects {
    background-color: #ff0000;
  }
  
  
  .photo {
    width: 100%;
    height: 350px;
    object-fit: contain;
  }
  
  
  .column p {
    text-align: center;
    font-size: 14px;
    color: #333;
  }
  
  /* IMAGEN */
  .encabezado-img {
    height: auto;
    width: 100%;
    box-sizing: border-box;
    margin-top: -12px;
  }
  
  /* ÁREAS Y CRITERIOS */
  .notification {
    color: #0e0b74;
    font-weight: bold;
    height: fit-content;
    padding: 5px 0 0 5px;
  }
  
  .notification-section {
    display: flex;
    flex-direction: column;
    border: 1px solid black;
    margin: 0 5px 10px 5px;
  }
  
  .notification-section textarea {
    font-size: 16px;
    resize: none;
    width: 100%;
    min-height: 60px;
    background: transparent;
    overflow: hidden; 
    line-height: 1.4;
  }
  
  

  
  .notification-section .form-control {
    width: 100%;               /* Asegura que el input ocupe el 100% del ancho disponible */
    max-width: 100%;           /* Limita el tamaño máximo del input */
    word-wrap: break-word;     /* Permite que el texto largo se ajuste y no se desborde */
    overflow: hidden;          /* Esconde el contenido que se desborda */
    white-space: normal;       /* Permite que el texto se divida en varias líneas */
}

  .criteria-section {
    margin-bottom: 1rem;
    transition: all 0.3s ease;
  }
  
  .criteria-title {
    background: yellow;
    font-size: 17px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 0.5rem;
    padding-top: 4px;
    border: solid 1px black;
  }
  
  /* FIRMAS */
  .signature-section {
    display: flex;
    justify-content: space-between;
    color: #000000;
    position: absolute;
    bottom: 30px;
    left: 0;
    width: 100%;
    padding: 0 2rem;
    box-sizing: border-box;
  }
  
  .signature {
    border-top: 1px solid #000;
    text-align: center;
    width: 45%;
    padding-top: 1px;
    font-weight: bold;
    margin-bottom: 15px;
  }
  
  /* FORMULARIO PRINCIPAL */
  .bulletin-form {
    width: 816px;
    height: 1056px;
    margin: auto;
    padding: 1rem;
    border: 4px double #000;
    font-family: Arial, sans-serif;
    overflow: hidden;
    box-sizing: border-box;
    background-color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
  .formularioPrincipal-card {
    background-color: transparent;
    border: 0px hidden;
    background: transparent;
  }
  
  .margin {
    width: auto;
    height: auto;
    padding: 20px;
    border: 0px hidden;
    margin: auto;
    background-color: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.50);
    border-radius: 0px !important;
  }
 
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }

`;break;
    case 'form2':
      styles = 
 `/* TÍTULO */
h2 {
  margin-top: 0
  ;
    font-size: 40px;
    color: red;
    text-align: center;
    text-decoration: underline;
    margin-bottom: 5px;
  }
  
  /* CONTENEDOR DE FOTOS */
.photos-container {
  display: flex;
  justify-content: center; /* Centra las fotos horizontalmente */
  align-items: center; /* Centra las fotos verticalmente */
  flex-wrap: wrap; /* Permite que las fotos se ajusten si no caben en una fila */
  gap: 10px; /* Espacio entre las fotos */
  overflow: hidden;
}

/* COLUMNA DE FOTOS */
.photo {
  width: 100%; /* Cada foto ocupa el 48% del ancho del contenedor */
  height: auto;
  max-height: 240px;
  object-fit: cover;
  border-radius: 20px;
  padding-top: 32px;
}
.photo2 {
  width: 100%; /* Cada foto ocupa el 48% del ancho del contenedor */
  height: auto;
  max-height: 130px;
  object-fit: cover;
  border-radius: 8px;
  margin: auto; /* Centra cada foto dentro de su contenedor */
}
  
  .column {
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
  }
  



  
  label {
    margin-bottom: 0;
  }
  
  /* INPUTS GENERALES */
  input {
    width: 100%;
    margin-bottom: 0.5rem;
    padding: 0.4rem;
    box-sizing: border-box;
    pointer-events: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  
  input:hover {
    border: 1px solid #007bff;
    background-color: #f8f8f8;
  }
  
  input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px #007bff;
    outline: none;
  }
  
  /* INPUTS INVÁLIDOS */
  input.ng-invalid.ng-touched {
    border: 1px solid red;
    background-color: #ffffff;
  }
  
  /* ESPECÍFICOS */
  .form-control {
    border-color: transparent;
    height: fit-content;
    color: #000;
    margin: 0;
    font-family: sans-serif !important;
    font-size: 18px;
    align-items: center;
    
  }
  
  .form-control1 {
    text-align: center;
    background-color: yellow;
    font-family: sans-serif !important;
    font-weight: bold;
    font-size: 20px;
    height: 28px;
    border: 1px solid #000;
  }
  
  .form-control,
  .form-control1 {
    white-space: normal;       /* Permite que el texto se ajuste en varias líneas si es necesario */
    overflow-wrap: break-word; /* Rompe las palabras largas */
    word-break: break-word;    /* Corta las palabras muy largas si es necesario */
  }

  /* CONTENEDORES */
  .input-container-m2 {
    display: flex;
  
  }
  
  .input-container-m2 label {
    font-size: 16px;
    min-width: max-content;
    font-weight: bold;
  }
  
  .input-container-m2 input{
    flex-grow: 0;
    font-size: 16px;
    padding: 0 0 0 10px;
    color: #000 !important;
  }
  .input-container-m2 textarea{
    flex-grow: 1;
    font-size: 14px;
    padding: 0 0 0 5px;
    color: #000 !important;
    min-width: max-content;
    overflow: hidden;
    resize: none;
  }
  .asd1{
    padding: 0 5px;
    text-align: justify;
    min-height: 60px;
  }
  /* SECCIONES */
  .info-section {
    background-color: #ffffff;
    display: flex;
    color: black;
    border: solid 1px black;
    padding-left: 5px;
    transition: all 0.3s ease;
    margin-bottom: 10px;
  }
  
  .left, .right {
    flex: 1;
    margin-right: 1rem;
  }
  
  .right {
    margin-right: 0;
  }
  
  .columns {
    display: flex;
    align-items: center; /* Asegura que todas las columnas tengan la misma altura */
    gap: 10px; /* Espacio entre columnas */
  }
  
  .column {
    position: relative;
    flex: 1;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center; /* Asegura que el contenido esté centrado verticalmente */
    align-items: center;     /* Centra el contenido horizontalmente */
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    border-top: 1px solid #000;
    border-right: 1px solid #000;
    border-left: 1px solid #000;
    border-bottom: none;
    height: 260px;
    overflow: hidden; /* Evita que el contenido se desborde fuera del recuadro */
}
.columns-1 {
  display: flex;
  align-items: center; /* Asegura que todas las columnas tengan la misma altura */
  gap: 10px; /* Espacio entre columnas */
}
.column-1 {
  position: relative;
  flex: 1;
  padding: 5px;
  flex-direction: column;
  justify-content: center; /* Asegura que el contenido esté centrado verticalmente */
  align-items: center;     /* Centra el contenido horizontalmente */
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  border-top: none;
  border-right: 1px solid #000;
  border-left: 1px solid #000;
  border-bottom: 1px solid #000;
  height: 150px;
  overflow: hidden; /* Evita que el contenido se desborde fuera del recuadro */
}
  .accept,
  .defects {
    position: absolute;
    top: 5px;
    left: 5px;
    padding: 5px 10px;
    font-weight: bold;
    border-radius: 10px;
    color: #000;
  }
  
  .accept {
    background-color: #00ff0d;
  }
  
  .defects {
    background-color: #ff0000;
  }  
  
  .column p {
    text-align: center;
    font-size: 14px;
    color: #333;
  }
  
  /* IMAGEN */
  .encabezado-img {
    height: auto;
    width: 100%;
    box-sizing: border-box;
    margin-top: -12px;
  }
  
  /* ÁREAS Y CRITERIOS */
  .notification {
    color: #0e0b74;
    font-weight: bold;
    height: fit-content;
    padding: 5px 0 0 5px;
  }
  
  .notification-section {
    display: flex;
    flex-direction: column;
    border: 1px solid black;
    margin: 0 5px 10px 5px;
  }
  
  .notification-section textarea {
    font-size: 16px;
    resize: none;
    width: 100%;
    min-height: 60px;
    background: transparent;
    overflow: hidden;
    line-height: 1.4;
  }
  

  
  .notification-section .form-control {
    width: 100%;               /* Asegura que el input ocupe el 100% del ancho disponible */
    max-width: 100%;           /* Limita el tamaño máximo del input */
    word-wrap: break-word;     /* Permite que el texto largo se ajuste y no se desborde */
    overflow: hidden;          /* Esconde el contenido que se desborda */
    white-space: normal;       /* Permite que el texto se divida en varias líneas */
}
   
  .criteria-section {
    margin-bottom: 0;
    transition: all 0.3s ease;
  }
  
  .criteria-title {
    background: yellow;
    font-size: 17px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 0.5rem;
    padding-top: 4px;
    border: solid 1px black;
  }
  
  /* FIRMAS */
  .signature-section {
    display: flex;
    justify-content: space-between;
    color: #000000;
    position: absolute;
    bottom: 30px;
    left: 0;
    width: 100%;
    padding: 0 2rem;
    box-sizing: border-box;
  }
  
  .signature {
    border-top: 1px solid #000;
    text-align: center;
    width: 45%;
    padding-top: 1px;
    font-weight: bold;
  }
  
  /* FORMULARIO PRINCIPAL */
  .bulletin-form {
    width: 816px;
    height: 1056px;
    margin: auto;
    padding: 1rem;
    border: 4px double #000;
    font-family: Arial, sans-serif;
    overflow: hidden;
    box-sizing: border-box;
    background-color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
  .formularioPrincipal-card {
    background-color: transparent;
    border: 0px hidden;
    background: transparent;
  }
  
  .margin {
    width: auto;
    height: auto;
    padding: 20px;
    border: 0px hidden;
    margin: auto;
    background-color: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.50);
    border-radius: 0px !important;
  }

  
 
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }

`;
      break;
  }
//#endregion
       printWindow.document.write(`
      <html>
        <head>
          <title>Boletín de Calidad</title>
          <style>${styles}</style>
        </head>
        <body>
          ${updatedContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onafterprint = () => {
      this.clearFields();
      printWindow.close();
    };

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();

      // Aquí aumentas el contador local para la sesión, no en backend
      this.currentPrints = (this.currentPrints || 0) + 1;

    }, 700);

  } else {
    console.error("No se pudo abrir la ventana de impresión o no se encontró el formulario.");
  }
}





// Método para limpiar los campos
clearFields() {
// Limpia los formularios
this.fullform.reset();

// Limpia los datos que se muestran
this.bulletinData = null;
this.detailsData = null;
this.qualityPhotosBase64 = null;
this.defectPhotosBase64 = null;
this.qualityPhotosBase641=null;
this.defectPhotosBase641=null;

// Limpia la vista de las fotos
const photoElements = document.querySelectorAll('.photo');
photoElements.forEach((photo) => {
(photo as HTMLImageElement).src = '';
});

///console.log('Campos limpiados después de la impresión o cancelación.');
}

}

