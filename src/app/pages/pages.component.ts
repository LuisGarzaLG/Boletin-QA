import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
loading: boolean = false;
  private windowReferences: { [key: string]: Window | null } = {};

  

  private openWindow(windowKey: string, url: string): void {
    const windowRef = this.windowReferences[windowKey];

    // Verificamos si la referencia de la ventana no es null y si está cerrada
    if (!windowRef || windowRef.closed) {
      // Si la ventana no existe o está cerrada, la abrimos
      this.windowReferences[windowKey] = window.open(url, '_blank');
    } else {
      // Si la ventana ya está abierta, solo la traemos al frente
      windowRef.focus();
    }
  }
  constructor() { }

  ngOnInit(): void {
  }

}
