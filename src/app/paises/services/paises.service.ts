import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { Pais, PaisSmall } from '../interfaces/paises.interface';

@Injectable({
  providedIn: 'root',
})
export class PaisesService {
  // PORPIEDADES
  private _baseUrl: string = 'https://restcountries.com/v2';
  private _regiones: string[] = [
    'Africa',
    'Americas',
    'Asia',
    'Europe',
    'Oceania',
  ];

  // GETTER
  get regiones(): string[] {
    return [...this._regiones];
  }

  // CONSTRUCTOR
  constructor(private http: HttpClient) {}

  // MÉTODOS
  getPaisesPorRegion(region: string): Observable<PaisSmall[] | null> {
    if (!region) {
      return of(null);
    }
    const url = `${this._baseUrl}/region/${region}?fields=alpha3Code,name`;

    return this.http.get<PaisSmall[]>(url);
  }

  getPaisPorCodigo(codigo: string): Observable<Pais | null> {
    // Validación en caso no exista el código, es decir, sea vacio
    if (!codigo) {
      return of(null);
    }

    const url = `${this._baseUrl}/alpha/${codigo}`;

    return this.http.get<Pais>(url);
  }

  getPaisPorCodigoSmall(codigo: string): Observable<PaisSmall> {
    const url = `${this._baseUrl}/alpha/${codigo}?fields=alpha3Code,name`;

    return this.http.get<PaisSmall>(url);
  }

  getPaisesPorCodigos(borders: string[]): Observable<PaisSmall[]> {
    // Si no recibimos borders, devolvemos un arreglo vacio
    if (!borders) {
      return of([]);
    }

    // Declararemos el arreglo que contendrá las peticiones http a ejecutar.
    // Especificamos de forma opcional que será de tipo "Observable" emitiendo un "PaisSmall"
    const peticiones: Observable<PaisSmall>[] = [];

    borders.forEach((codigo) => {
      // Almaceno la peticion de cada iteración, con su correspondiente código
      const peticion = this.getPaisPorCodigoSmall(codigo);
      // Agrego cada petición http al arreglo
      peticiones.push(peticion);
    });
    // combineLatest : Diparamos todas las peticiones del arreglo de forma simultánea.
    // Es como un "subscribe()" a cada petición
    // Retorna un Observable que contiene un arreglo con el resutaltado de todas las peticiones
    return combineLatest(peticiones);
  }
}
