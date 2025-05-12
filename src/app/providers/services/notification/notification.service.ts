import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor() {}

    success(message: string, title: string = 'Éxito'): void {
    Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
    });
    }

    error(message: string, title: string = 'Error'): void {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        showConfirmButton: false,
    });
    }

    info(message: string, title: string = 'Información'): void {
    Swal.fire({
        icon: 'info',
        title: title,
        text: message,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
    });
    }

    warning(message: string, title: string = 'Advertencia'): void {
    Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
    });
    }

    confirm(
    title: string,
    message: string,
    confirmButtonText: string = 'Confirmar',
    cancelButtonText: string = 'Cancelar'
    ): Promise<boolean> {
    return Swal.fire({
        title,
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
    }).then((result) => result.isConfirmed);
    }
}