import { HttpEvent, HttpHandler, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})

export class TokenInterceptorService{
  constructor() {}
    
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {    
    let jwtToken = req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + window.sessionStorage.getItem('token')
      }
    });
    return next.handle(jwtToken);
  }
}