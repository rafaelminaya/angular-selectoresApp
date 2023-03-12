import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, tap } from 'rxjs';
import { PaisSmall } from '../../interfaces/paises.interface';
import { PaisesService } from '../../services/paises.service';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {
  // PROPIEDADES
  miFormulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    pais: ['', Validators.required],
    frontera: ['', Validators.required],
  });

  // arreglo que contendrá los selectores
  regiones: string[] = [];
  paises: PaisSmall[] = [];
  fronteras: PaisSmall[] = [];
  // UI
  cargando: boolean = false;

  // CONSTRUCTOR
  constructor(private fb: FormBuilder, private paisesService: PaisesService) {}

  // MÉTODOS
  // usamos el métod "ngOnInit()" cuando queremos traer información de algún servicio y mostrarla el el HTML,
  // ya que el código dentro del "ngOnInit()" trabaja cuando el html ya está inicializado
  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;

    // Acción 'para cuando cambie el primer selector (region)
    // valueChanges :
    // - Permite obtener los cambios del valor en la propiedad "region" del formulario
    // -  Es un Observable que emite un any, es decir: Observable<any>

    // 1° Opción - Observables - subscribe()
    /*
    this.miFormulario.get('region')?.valueChanges.subscribe((region) => {
      console.log('region', region);

      this.paisesService.getPaisesPorRegion(region).subscribe((paises) => {
        console.log('paises', paises);

        this.paises = paises;
      });
    });
    */

    // 2° Opción - RXJS switchMap
    this.miFormulario
      .get('region')
      ?.valueChanges.pipe(
        // Reiniciamos los valores del combo de "pais" en cada cambio de region.
        // Lo haremos dentro "tap" ya que estamos dentro de un "pipe" donde debemos usar operadores de RXJS
        tap((region) => {
          console.log('region', region);
          this.miFormulario.get('pais')?.reset('');
          this.cargando = true;
          //this.miFormulario.get('frontera')?.disable();
        }),
        switchMap((region) => this.paisesService.getPaisesPorRegion(region))
      )
      .subscribe((paises) => {
        console.log('paises', paises);
        //  paises || [] : Significa que en caso no haya datos en el atributo "paises" devolverá un "[]" que representa un arreglo vacío.
        this.paises = paises || [];
        this.cargando = false;
      });

    this.miFormulario
      .get('pais')
      ?.valueChanges.pipe(
        // El guión bajo "_" en el argumento significa que el argumento recibido no será usado. Es una alternativa, también se puede dejar sin argumentos.
        tap((_) => {
          // Reiniciamos los valores de la propiedad "frontera" del formulario
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;

          //this.miFormulario.get('frontera')?.enable();
        }),
        switchMap((codigo) => this.paisesService.getPaisPorCodigo(codigo)),
        switchMap((pais) =>
          this.paisesService.getPaisesPorCodigos(pais?.borders!)
        )
      )

      .subscribe((paises) => {
        console.log('fronteras', paises);
        this.fronteras = paises;
        this.cargando = false;
      });
  }

  guardar() {
    console.log(this.miFormulario.value);
  }
}
