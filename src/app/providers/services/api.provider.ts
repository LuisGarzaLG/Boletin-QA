import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrProvider } from "../toastr/toastr-service";
import { TokenStorageService } from "./security/token-storage.service";
import { env } from "../../../environments/environment";

@Injectable({
    providedIn: "root",
})

export class ApiService {

    constructor(private http: HttpClient, private toastrProvider: ToastrProvider, private tokenService: TokenStorageService) { }

    httpHeaders = {
        headers: new HttpHeaders({
            "Content-Type": "application/json",
        }),
        headersContentTpye: new HttpHeaders({
            "Content-Type": "application/json",
        }),
        headersFromForm: new HttpHeaders({}),
    };
    public async LoginPost<T>(endPoint: string, entity: any): Promise<any> {
        return await this.http
            .post<T>(`${env.securityApi + endPoint}`, entity, {
                headers: this.httpHeaders.headersContentTpye,
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                return ex;
            });
    }
    //Obtener
    public async Get<T>(endPoint: string): Promise<any> {
        return this.http
            .get<T>(`${env.apiUrl + endPoint}`, {
                headers: this.httpHeaders.headers.append(
                    "Authorization",
                    "Bearer " + window.sessionStorage.getItem('token')
                ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {                
                this.toastrProvider.Danger(ex.message);
            });
    }
    //Obtenerby
    public async GetById<T>(endPoint: string, id: any, param?: any): Promise<any> {
        return this.http
            .get<T>(`${env.apiUrl + endPoint}?id=${id}&param=${param}`, {
                headers: this.httpHeaders.headers.append(
                    "Authorization",
                    "Bearer " + window.sessionStorage.getItem('token')
                ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
            });
    }
    //Crear
    public async Post<T>(endPoint: string, entity: any, isForm?: boolean): Promise<any> {
        return await this.http
            .post<T>(`${env.apiUrl + endPoint}`, entity, {
                headers: !isForm
                    ? this.httpHeaders.headers.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    )
                    : this.httpHeaders.headersFromForm.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
                return ex.error;
            });
    }
    //Actualizar
    public async Put<T>(endPoint: string, entity: any, id: any, isForm?: boolean): Promise<any> {
        return await this.http
            .put<T>(`${env.apiUrl + endPoint}/${id}`, entity, {
                headers: !isForm
                    ? this.httpHeaders.headers.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    )
                    : this.httpHeaders.headersFromForm.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
                throw ex;
            });
    }
    public async Put1<T>(endPoint: string, entity: any, isForm?: boolean): Promise<any> {
        return await this.http
            .put<T>(`${env.apiUrl + endPoint}`, entity, {
                headers: !isForm
                    ? this.httpHeaders.headers.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    )
                    : this.httpHeaders.headersFromForm.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
                throw ex;
            });
    }
    //ActualizarConElIdEnLaInformacion
    public async Putnt<T>(endPoint: string, entity: any, isForm?: boolean): Promise<any> {
        return await this.http
            .put<T>(`${env.apiUrl + endPoint}`, entity, {
                headers: !isForm
                    ? this.httpHeaders.headers.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    )
                    : this.httpHeaders.headersFromForm.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
                throw ex;
            });
    }
    //sctualizar de froma masiva
    public async PutMassively<T>(endPoint: string, entities: any[], isForm?: boolean): Promise<any> {
        return await this.http
            .put<T>(`${env.apiUrl + endPoint}`, entities, {
                headers: !isForm
                    ? this.httpHeaders.headers.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    )
                    : this.httpHeaders.headersFromForm.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
                throw ex;
            });
    }

    //Eliminar query parameter
    public async Delete<T>(endPoint: string, id: any): Promise<any> {
        return await this.http
            .delete<T>(`${env.apiUrl + endPoint}/${id}`, {
                headers: this.httpHeaders.headers.append(
                    "Authorization",
                    "Bearer " + window.sessionStorage.getItem('token')
                ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
                throw ex;
            });
    }

    public async Deletetwo<T>(endPoint: string, id: any, typeid: any): Promise<any> {
        return await this.http
            .delete<T>(`${env.apiUrl + endPoint}/${id}/${typeid}`, {
                headers: this.httpHeaders.headers.append(
                    "Authorization",
                    "Bearer " + window.sessionStorage.getItem('token')
                ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
                throw ex;
            });
    }

    public async RefreshToken<T>(endPoint: string): Promise<any> {
        return await this.http
            .get<T>(`${env.securityApi + endPoint}`, {
                headers: this.httpHeaders.headers.append(
                    "Authorization",
                    "Bearer " + window.sessionStorage.getItem('token')
                ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                return ex;
            });
    }

    public async Accounts<T>(endPoint: string): Promise<any> {
        return this.http
            .get<T>(`${env.securityApi + endPoint}`, {
                headers: this.httpHeaders.headers.append(
                    "Authorization",
                    "Bearer " + window.sessionStorage.getItem('token')
                ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
            });
    }

    public async AccountsUpdateProfile<T>(endPoint: string, entity: any, isForm?: boolean): Promise<any> {
        return await this.http
            .post<T>(`${env.securityApi + endPoint}`, entity, {
                headers: !isForm
                    ? this.httpHeaders.headers.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    )
                    : this.httpHeaders.headersFromForm.append(
                        "Authorization",
                        "Bearer " + window.sessionStorage.getItem('token')
                    ),
                observe: "response",
            })
            .toPromise()
            .then((data) => {
                return data;
            })
            .catch((ex) => {
                this.toastrProvider.Danger(ex.message);
                return ex.error;
            });
    }

}

export class Result {
    Succeeded!: boolean;
    Message!: string;
    Errors!: Array<string>;
}