import { Component } from '@angular/core';
import { NotificationService } from 'src/app/providers/services/notification/notification.service';
import { qualityrequestsprovaider } from 'src/app/providers/services/quality request/qualityBrequestsprovaider';
import { CreateBulletinDto2} from 'src/app/providers/models/quality-request-all-models';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent {
  bulletinID: string = ''; // Para almacenar el ID del boletín a buscar
  bulletin: CreateBulletinDto2 = {
    bulletinID: '',
    area: '',
    partNumber: '',
    startDate: '',
    endDate: '',
    customer: '',
    supplier: '',
    name: '',
    failureName: '',
    previousID: '',
    problemsDetails: {
      description:'',
      actions:''
      ,reworkDetails:''
    }
  };

  constructor(
    private qualityrequestsprovaider: qualityrequestsprovaider,
    private notificationService: NotificationService
  ) {}

  // Función para buscar el boletín por su ID
  searchBulletin() {
    this.qualityrequestsprovaider.GetBulletinBy(this.bulletinID).then(data => {
      if (data) {
        if (data.startDate) {
          data.startDate = data.startDate.substring(0, 10);
        }
        if (data.endDate) {
          data.endDate = data.endDate.substring(0, 10);
        }
        
        this.bulletin = data;  // Se asigna el boletín encontrado a 'bulletin'
      } else {
        this.notificationService.warning('Boletín no encontrado');
      }
    }).catch(err => {
      console.error('Error al buscar el boletín:', err);
      this.notificationService.error('Ocurrió un error al buscar el boletín');
    });
    
  }
  

  // Función para actualizar los datos del boletín
  async updateBulletin() {
    const result = await Swal.fire({
      title: '¿Quieres actualizar el boletín?',
      text: 'Se guardarán los cambios en la base de datos',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      confirmButtonColor: '#598bff',
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#3b4355',
      customClass: {
        popup: 'swal2-borderless',
      }
    });
  
    if (!result.isConfirmed) {
      return; // El usuario canceló
    }
    const bulletinData = {
        bulletinID: this.bulletin.bulletinID, 
        area: this.bulletin.area,
        failureName: this.bulletin.failureName,
        name: this.bulletin.name,
        startDate: this.bulletin.startDate,
        endDate: this.bulletin.endDate,
        customer: this.bulletin.customer,
        supplier: this.bulletin.supplier,
        partNumber: this.bulletin.partNumber,
        previousID: this.bulletin.previousID,
        updateDetails: {
          description: this.bulletin.problemsDetails?.description,
          actions: this.bulletin.problemsDetails?.actions,
          reworkDetails: this.bulletin.problemsDetails?.reworkDetails
        }
    };
         console.log('Enviando a la API:', bulletinData);
        this.qualityrequestsprovaider.updateBulletinData(bulletinData).then(() => {
      
        this.notificationService.info('Boletín actualizado correctamente');
        
        // Limpiar los campos después de la actualización
        this.bulletin = {
          bulletinID: '',
          area: '',
          partNumber: '',
          startDate: '',
          endDate: '',
          customer: '',
          supplier: '',
          name: '',
          failureName: '',
          previousID: '',
          problemsDetails: {
            description: '',
            actions: '',
            reworkDetails: ''
          }
        };
        
        
        
        // Limpiar el campo del buscador
        this.bulletinID = '';

    }).catch(err => {
        this.notificationService.error('Error al actualizar el boletín');
    });
}

}