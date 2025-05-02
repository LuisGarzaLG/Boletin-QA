export const appKey = 'Sparta V';
export const platformId = 'Sparta V';
export const version = '1.0.0';
export const token = 'Bearer ' + localStorage.getItem('token');

export interface Env{
    version: string;
    apiUrl : string,
    dashboardApi: string,
    securityApi: string,
    appKey : string,  
    production: boolean,
    platformId: string,
    currentUserToken: string;
    cs_orgId:any;
    cs_merchantId:any;
}