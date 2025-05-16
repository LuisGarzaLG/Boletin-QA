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
    background: '#333',
    color: '#fff', // aplica al texto general
    customClass: {
      title: 'custom-toast-title'
    }
  });
}

    succes(message: string, title: string = 'Éxito'): void {
    Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-start',
        background: '#333',
        color: '#fff', // aplica al texto general
        customClass: {
        title: 'custom-toast-title'
        }
    });
    }

    error(message: string, title: string = 'Error'): void {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        showConfirmButton: false,
        background: '#333',
        color: '#fff', // aplica al texto general
        customClass: {
        title: 'custom-toast-title'
        }
    });
    }
    eror(message: string, title: string = 'Error'): void {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        showConfirmButton: false,
         timer: 3000,
        background: '#333',
        color: '#fff', // aplica al texto general
        customClass: {
        title: 'custom-toast-title'
        }
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
        background: '#333',
        color: '#fff', // aplica al texto general
        customClass: {
        title: 'custom-toast-title'
        }        
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
        background: '#333',
        color: '#fff', // aplica al texto general
        customClass: {
        title: 'custom-toast-title'
        }
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
        background: '#333',
        color: '#fff',
        customClass: {
            title: 'custom-toast-title'
        }
    }).then((result) => result.isConfirmed);
}
}