import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CreateBulletinDto, Details } from 'src/app/providers/models/quality-request-all-models';
import { NotificationService } from 'src/app/providers/services/notification/notification.service';
import { qualityrequestsprovaider } from 'src/app/providers/services/quality request/qualityBrequestsprovaider';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
})
export class DeleteComponent implements OnInit {
  searchForm!: FormGroup;
  isEditing: boolean = false;
  bulletinData: CreateBulletinDto | null = null;
  detailsData: Details | null = null;

  constructor(
    private fb: FormBuilder,
    private provider: qualityrequestsprovaider,
    private notificationService: NotificationService
  ) {
    this.searchForm = this.fb.group({
      bulletinID: [''],
    });
  }

  ngOnInit(): void {}

  // Función para buscar el boletín y los detalles con un solo botón
  async onSearchBoth() {
    const bulletinID = this.searchForm.get('bulletinID')?.value;
    if (bulletinID) {
      try {
        // Primero, buscar el boletín
        const BulletinData: CreateBulletinDto | null = await this.provider.GetBulletinBy(bulletinID);
        if (BulletinData) {
          this.bulletinData = BulletinData;
          this.isEditing = true;
        } else {
          // Usar confirmación de notificación
          await this.notificationService.info(
            'Boletín no encontrado',
            'Por favor, ingrese un boletín válido.'
          );
          this.isEditing = false;
          this.bulletinData = null;
          return;
        }

        // Luego, buscar los detalles del boletín
        const DetailsData: Details | null = await this.provider.GetDetailsBy(bulletinID);
        if (DetailsData) {
          this.detailsData = DetailsData;
          console.log('Detalles del boletín encontrados:', DetailsData);
        } else {
          // Usar confirmación de notificación
          await this.notificationService.info(
            'Detalles no encontrados',
            'No se encontraron detalles asociados al boletín.'
          );
          this.detailsData = null;
        }

      } catch (error) {
        console.error('Error al obtener los datos del boletín o detalles:', error);
        await this.notificationService.info(
          'Error al obtener los datos',
          'Hubo un problema al obtener los datos o detalles del boletín.'
        );
        this.isEditing = false;
        this.bulletinData = null;
        this.detailsData = null;
      }
    } else {
      // Usar confirmación de notificación
      await this.notificationService.info(
        'Número de boletín inválido',
        'Por favor, ingrese un número de boletín válido.'
      );
    }
  }

  // Función para eliminar el boletín con confirmación
  async onDeleteSubmit() {
    const bulletinID = this.searchForm.get('bulletinID')?.value;

    if (bulletinID) {
      try {
        // Mostrar la confirmación antes de proceder con la eliminación
        const confirmed = await this.notificationService.confirm(
          '¿Estás seguro?',
          'Esta acción eliminará el boletín permanentemente.',
          'Sí, eliminar',
          'Cancelar'
        );

        if (confirmed) {
          // Si el usuario confirma, proceder con la eliminación
          await this.provider.DeleteBulletin(bulletinID);

          // Llamamos al método refreshdata() para actualizar la lista de boletines
          this.provider.refreshdata();  // Actualiza la lista de boletines después de la eliminación
          
          this.isEditing = false;
          this.bulletinData = null; // Limpiar los datos después de eliminar
          this.detailsData = null;
          this.searchForm.reset(); // Limpiar el formulario de búsqueda
        } else {
          // Si el usuario cancela, no hacer nada
        }
      } catch (error) {
        console.error('Error al eliminar el boletín:', error);
        await this.notificationService.info(
          'Error al eliminar',
          'Hubo un error al intentar eliminar el boletín.'
        );
      }
    }
  }
}
