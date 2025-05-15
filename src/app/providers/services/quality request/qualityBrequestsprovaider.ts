import { Injectable } from "@angular/core";
import { BaseProvider } from "../base.provider";
import { BehaviorSubject } from "rxjs";
import { HttpResponse } from "@angular/common/http";
import { CreateBulletinDto, CreateBulletinDto2, Details, FullBulletinDto, GetAllBulletins,PhotoUploadDto } from "../../models/quality-request-all-models";
import { NotificationService } from "../notification/notification.service";
import { ApiService } from "../api.provider"; // Asegúrate de importar ApiService
import { ToastrProvider } from "../../toastr/toastr-service"; // Asegúrate de importar ToastrProvider
import { TokenStorageService } from "../security/token-storage.service"; // Asegúrate de importar TokenStorageService


@Injectable({ providedIn: "root" })
export class qualityrequestsprovaider extends BaseProvider {
    constructor(
        private notificationService: NotificationService,
        baseService: ApiService,
        toastService: ToastrProvider,
        tokenStorageService: TokenStorageService
    ) {
        super(baseService, toastService, tokenStorageService); // Pasando los parámetros al constructor de la clase base
    }


    private endpointgetallbulletins = '/api/v1/qa/getallbulletins';
    private endpointcreatebulletin = '/api/v1/qa/createboletin';
    private endpointcreatephotos = '/api/v1/qa/createphotos'
    private endpointdeletebulletin = '/api/v1/qa/deletebulletin';
    private endpointgetbulletinbyid = '/api/v1/qa/getbulletinbyid';
    private endpointgetdetailsbyid = '/api/v1/qa/getdetailsbyid';
    private endpointgetbulletinphotos = '/api/v1/qa/getbulletinphotos';
    private endpointupdatebulletinqa = '/api/v1/qa/updatebulletinqa';
    private endpointupdatebulletininproduction = '/api/v1/qa/updatebulletininproduction'
    private endpointGetallbulletinsnonExpired = '/api/v1/qa/getallbulletinsonexpired/'
    

    public async GetAllBulletinsNonExpired(): Promise<GetAllBulletins[]> {
        return await this.service.Get<GetAllBulletins[]>(this.endpointGetallbulletinsnonExpired)
            .then((data: HttpResponse<GetAllBulletins[]>) => {
                return data.body || [];
            });
    }

    
    public async GetAllBulletin(): Promise<GetAllBulletins[]> {
        return await this.service.Get<GetAllBulletins[]>(this.endpointgetallbulletins)
            .then((data: HttpResponse<GetAllBulletins[]>) => {
                return data.body || [];
            });
    }




    public async GetBulletinBy(bulletinId: string): Promise<CreateBulletinDto2 | null> {
        if (!bulletinId || typeof bulletinId !== 'string') {
            console.error('ID de boletín inválido:', bulletinId);
            return null;
        }
        try {
            const response = await this.service.Get<CreateBulletinDto2>(`${this.endpointgetbulletinbyid}/${bulletinId}`);
            if (response && response.body) {
                return response.body;
            } else {
                console.error('La respuesta no contiene un cuerpo válido');
                return null;
            }
        } catch (error) {
            console.error('Error al obtener los datos del boletín:', error);
            return null;
        }
    }




    public async GetDetailsBy(bulletinId: string): Promise<Details | null> {
        if (!bulletinId || typeof bulletinId !== 'string') {
            console.error('ID de boletín inválido:', bulletinId);
            return null;
        }

        try {
            const response = await this.service.Get<Details>(`${this.endpointgetdetailsbyid}/${bulletinId}`);
            if (response && response.body) {
                return response.body;
            } else {
                console.error('La respuesta no contiene un cuerpo válido');
                return null;
            }
        } catch (error) {
            console.error('Error al obtener los detalles del boletín:', error);
            return null;
        }
    }

    public async GetBulletinPhotosBy(bulletinId: string): Promise<PhotoUploadDto[] | null> {
        if (!bulletinId || typeof bulletinId !== 'string') {
            console.error('ID de boletín inválido:', bulletinId);
            return null;
        }
        try {
            const response = await this.service.Get<PhotoUploadDto[]>(`${this.endpointgetbulletinphotos}/${bulletinId}`);
            if (response && response.body) {
                return response.body;
            } else {
                console.error('La respuesta no contiene un cuerpo válido');
                return null;
            }
        } catch (error) {
            console.error('Error al obtener las fotos del boletín:', error);
            return null;
        }
    }
    




    public async CreateBulletins(createbulletin: CreateBulletinDto): Promise<number> {
        try{

            return await this.service.Post<{ Id: number }>(this.endpointcreatebulletin, createbulletin)
            .then(response => {
                if (response.status >= 200 && response.status <= 299) {
                    // Usando notificación de éxito
                    this.notificationService.info('Boletín creado con éxito');
                    return response.body?.ID;
                }
                
            });
        }
        catch (error){
            this.notificationService.warning('Ocurrió un problema al crear el boletín');
            console.log(error)
        }
        return 0;
    }




    public async CreateBulletin(createbulletin: Details): Promise<number> {
        return await this.service.Post<{ Id: number }>(this.endpointcreatebulletin, createbulletin)
            .then(response => {
                if (response.status >= 200 && response.status <= 299) {
                    // Usando notificación de éxito
                    this.notificationService.info('Boletín creado con éxito');
                    return response.body?.ID;
                }
                this.notificationService.warning('Ocurrió un problema al crear el boletín');
            });
            
    }



    public async createPhotos(photoPayload: PhotoUploadDto): Promise<number>{
        return await this.service.Post<{ Id: number }>(this.endpointcreatephotos, photoPayload)
    .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
            return response.body?.ID;
        }
    });
    }



    public async FullBulletin(fullbulletin: FullBulletinDto): Promise<number> {
        try {
          const response = await this.service.Post<{ Id: number }>(this.endpointcreatebulletin, fullbulletin);
      
          if (response.status >= 200 && response.status <= 299) {
            this.notificationService.info('Boletín creado con éxito');
            return response.body?.Id ?? 0;  // <- Usa la I mayúscula correcta y valor por defecto
          } else {
            this.notificationService.warning('Ocurrió un problema al crear el boletín');
            return 0;
          }
        } catch (error) {
          this.notificationService.warning('Hubo un error al procesar la solicitud');
          return 0;
        }
      }
      




    public async DeleteBulletin(id: string): Promise<void> {
        return await this.service.Delete<HttpResponse<any>>(this.endpointdeletebulletin, id)
            .then(() => {
                // Actualizamos los datos y mostramos una notificación de éxito
                this.refreshdata();
                this.notificationService.info(`Boletín con ID ${id} eliminado con éxito.`);
            })
            .catch(error => {
                // Usando notificación de error en caso de falla
                this.notificationService.error('Error al eliminar el boletín');
                throw error;
            });
    }

    private bulletinSubject = new BehaviorSubject<GetAllBulletins[]>([]);
    bulletins$ = this.bulletinSubject.asObservable();
    public get currentbulletin(): GetAllBulletins[] { return this.bulletinSubject.value; }

    public refreshdata(): void {
        this.GetAllBulletin().then((bulletin) => { this.bulletinSubject.next(bulletin); });
    }





    public async updateBulletinData(bulletin: CreateBulletinDto2): Promise<void> {
        if (!bulletin.bulletinID) {
            console.error('El bulletinID no es válido');
            return;
        }
    
        // Llamamos al servicio Put pasando tres parámetros
        return await this.service.Put1(`${this.endpointupdatebulletinqa}`, bulletin)
            .then(() => {
                this.notificationService.info('Boletín actualizado con éxito');
            })
            .catch(() => {
                this.notificationService.error('Error al actualizar el boletín');
            });
    }
    
    
        public async updateBulletinInProduction(bulletinID: string, inProduction: boolean): Promise<void> {
            if (!bulletinID) {
                console.error('El bulletinID no es válido');
                return;
            }

            const payload = {
                bulletinID,
                inProduction
            };

            return await this.service.Put1(`${this.endpointupdatebulletininproduction}`, payload)
                .then(() => {
                    this.notificationService.info('Estatus actualizado correctamente');
                })
                .catch(() => {
                    this.notificationService.error('Error al actualizar el estatus del boletín');
                });
        }


    
    
    
}





