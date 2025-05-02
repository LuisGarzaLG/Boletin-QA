import { Injectable } from "@angular/core";
import { NbToastrService } from "@nebular/theme";

@Injectable({
    providedIn: 'root'
})

export class ToastrProvider {

    constructor(private toastrService: NbToastrService) { }

    Success(message: any) {
        this.toastrService.success(message, 'Successfully', { icon: 'checkmark-circle-2-outline' })
    }

    Info(message: any, title: any) {
        this.toastrService.info(message, title)
    }

    Warning(message: any) {
        this.toastrService.warning(message, 'Warning')
    }

    Primary(message: any, title: any) {
        this.toastrService.primary(message, title)
    }

    Danger(message: any) {
        this.toastrService.danger(message, 'Error', { icon: 'alert-circle-outline' })
    }

    ShowGenericError() {
        this.Danger("generics.error")
    }
}