import { Injectable } from "@angular/core";
import { ToastrProvider } from "../toastr/toastr-service";
import { ApiService } from "./api.provider";
import { TokenStorageService } from "./security/token-storage.service"; 

@Injectable({ providedIn: "root" })
export class BaseProvider {
  constructor(private baseService: ApiService, private toastService: ToastrProvider, public tokenStorageService: TokenStorageService) 
  { }
  
  service = this.baseService;
  toastProvider = this.toastService;      
  userName: string = '';
  token: string = '';
  
}