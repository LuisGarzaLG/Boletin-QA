export interface GetAllBulletins{
    bulletinID: string,
    area: string,
    partNumber: string,
    startDate: string,
    endDate: string,
    customer: string,
    supplier: string,
    name: string,
    failureName: string,
    previousID: string
}

export interface CreateBulletinDto{
    bulletinID: string,
    area: string,
    partNumber: string,
    startDate: string,
    endDate: string,
    customer: string,
    supplier: string,
    name: string,
    failureName: string,
    previousID: string
    creatorUser: string,
    creatorName:string,
    impressions:0,
    inProduction: boolean | null,
    details?: Details;
    }
    export interface CreateBulletinDto2 {
      bulletinID: string;
      area: string;
      partNumber: string;
      startDate: string;
      endDate: string;
      customer: string;
      supplier: string;
      name: string;
      failureName: string;
      previousID: string;
      creatorUser: string;
      creatorName:string;
      impressions:0;
      inProduction: boolean | null;
      problemsDetails?: {
        description: string;
        actions: string;
        reworkDetails: string;
      };
    }
    

export interface Details {
    bulletinID: string;
    description: string;
    actions: string;
    reworkDetails: string;
    photos: Photos
    photos2: PhotoUploadDto
  }
  export interface Details2 {
    bulletinID: string;
    description: string;
    actions: string;
    reworkDetails: string;
  }
  

  export interface FullBulletinDto {
    bulletin: CreateBulletinDto;
    details: Details2;
    emailCreator: string,
    qualityPhotos: string | null; 
    defectPhotos: string | null;
  }


export interface FormField {
    name: string;
    label: string;
    type?: 'text' | 'date';
}

export interface Comments {
    bulletinID: string,
    comment: string
}
export interface Photos {
    id: number;
    bulletinId: string;
    qualityPhotos: string | null; // Aquí guardamos el código base64 de la foto
    defectPhotos: string | null;  // Aquí guardamos el código base64 de la foto
  }


  export interface PhotoUploadDto {
    id: number;
    bulletinID: string;
    qualityPhotos: string | null;
    defectPhotos: string | null;
  }
  