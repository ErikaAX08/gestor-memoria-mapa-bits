/*
Practica 2: Mapa de bits
Materia: Sistemas Operativos II
Integrantes del equipo:
    - Morales Lopez Diana Jazmin
    - Hernandez Prado Osmar Javier
    - Amastal Xochimitl Erika
*/

interface Proceso {
    id: string;
    nombre: string;
    tamano: number;
    indexInicio: number;
    numeroBloquesOcupados: number;
    color: string;
}

export type AlgoritmoAsignacion = 'first' | 'next' | 'best' | 'worst';

export class GestorMemoria {
    private memoriaTotal: number;
    private tamanoBloque: number;
    private totalBloques: number;
    private mapaDeBits: Uint32Array; //Unsigned int mapaDeBits[]
    private listaDeProcesos: Proceso[];
    private ultimoIndiceAsignado: number = 0; // Pointer para Next Fit

    constructor(memoriaTotal: number, tamanoBloque: number) {
        this.memoriaTotal = memoriaTotal;
        this.tamanoBloque = tamanoBloque;
        this.totalBloques = Math.ceil(memoriaTotal / tamanoBloque);
        this.mapaDeBits = new Uint32Array(Math.ceil(this.totalBloques / 32)); //Un entero guarda 32 bloques
        this.listaDeProcesos = [];
    }

    public printLoSentimos(mensaje: string): string {
        return "\t--- Lo sentimos: " + mensaje + " ---";
    }

    private checkBit(indexGlobal: number): boolean {
        const indexArray = Math.floor(indexGlobal / 32);
        const offsetDeBit = indexGlobal % 32;
        const mascara = 1 << offsetDeBit;
        if ((this.mapaDeBits[indexArray] & mascara) !== 0) {
            return true;
        } else {
            return false;
        }
    }

    private setBitRange(inicio: number, numeroAPoner: number, ocupado: boolean): void {
        for (let i = 0; i < numeroAPoner; i++) {
            const pos = inicio + i;
            const indexArray = Math.floor(pos / 32);
            const offsetDeBit = pos % 32;
            const mascara = 1 << offsetDeBit;

            if (ocupado==true) {
                this.mapaDeBits[indexArray] |= mascara; //Poner bit en 1 sin tocar el resto
            } else {
                this.mapaDeBits[indexArray] &= (~mascara); //Poner bit en 0 sin tocar el resto
            }
        }
    }

    //Esto es un First fit temporal
    private encontrarEspacioLibre(numBloquesNecesarios: number): number {
        let contadorBloquesLibres = 0;
        let inicioCandidato = -1;

        for(let i = 0; i < this.totalBloques; i++) {
            if( ! this.checkBit(i) ) {
                if(contadorBloquesLibres === 0) {
                    inicioCandidato = i;
                }
                contadorBloquesLibres++;
            } else {
                contadorBloquesLibres = 0;
                inicioCandidato = -1;
            }

            if(contadorBloquesLibres === numBloquesNecesarios) {
                return inicioCandidato;
            }
        }
        return -1; //Osea, no hay memoria suficiente
    }

    private encontrarNextFit(numBloques: number): number {
        let contador = 0;
        let inicio = -1;
        for (let i = 0; i < this.totalBloques; i++) {
            const idx = (this.ultimoIndiceAsignado + i) % this.totalBloques;
            if (!this.checkBit(idx)) {
                if (contador === 0) inicio = idx;
                if (++contador === numBloques) {
                    this.ultimoIndiceAsignado = (inicio + numBloques) % this.totalBloques;
                    return inicio;
                }
            } else {
                contador = 0;
                inicio = -1;
            }
        }
        return -1;
    }

    private encontrarBestFit(numBloques: number): number {
        let mejorInicio = -1;
        let mejorTamano = Infinity;
        let contador = 0;
        let inicioActual = -1;

        for (let i = 0; i <= this.totalBloques; i++) {
            const libre = i < this.totalBloques ? !this.checkBit(i) : false;
            if (libre) {
                if (contador === 0) inicioActual = i;
                contador++;
            } else {
                if (contador >= numBloques && contador < mejorTamano) {
                    mejorTamano = contador;
                    mejorInicio = inicioActual;
                }
                contador = 0;
            }
        }
        return mejorInicio;
    }

    private encontrarWorstFit(numBloques: number): number {
        let peorInicio = -1;
        let peorTamano = -1;
        let contador = 0;
        let inicioActual = -1;

        for (let i = 0; i <= this.totalBloques; i++) {
            const libre = i < this.totalBloques ? !this.checkBit(i) : false;
            if (libre) {
                if (contador === 0) inicioActual = i;
                contador++;
            } else {
                if (contador >= numBloques && contador > peorTamano) {
                    peorTamano = contador;
                    peorInicio = inicioActual;
                }
                contador = 0;
            }
        }
        return peorInicio;
    }

    public crearProceso(nombre: string, tamanoBytes: number, color: string, algoritmo: AlgoritmoAsignacion = 'first'): string {
        if(tamanoBytes <= 0) return this.printLoSentimos("El tamaño debe ser mayor a 0");
        const numBloquesNecesarios = Math.ceil(tamanoBytes / this.tamanoBloque);
        let indice = -1;

        switch (algoritmo) {
            case 'first': indice = this.encontrarEspacioLibre(numBloquesNecesarios); break;
            case 'next':  indice = this.encontrarNextFit(numBloquesNecesarios); break;
            case 'best':  indice = this.encontrarBestFit(numBloquesNecesarios); break;
            case 'worst': indice = this.encontrarWorstFit(numBloquesNecesarios); break;
        }

        if(indice === -1) {
            return this.printLoSentimos("No hay memoria suficiente (Fragmentación o Memoria Llena)");
        }

        const nuevoProceso: Proceso = {
            id: Date.now().toString(),
            nombre: nombre,
            tamano: tamanoBytes,
            indexInicio: indice,
            numeroBloquesOcupados: numBloquesNecesarios,
            color: color
        };

        this.listaDeProcesos.push(nuevoProceso);
        this.setBitRange(indice, numBloquesNecesarios, true); //Con esto marcamos los bits como ocupados

        return `Proceso ${nombre} creado con éxito. ID: ${nuevoProceso.id}, Tamaño: ${tamanoBytes} bytes, Bloques ocupados: ${numBloquesNecesarios}, Índice de inicio: ${indice}`;
    }

    public eliminarProceso(idProceso: string): string {
        const index = this.listaDeProcesos.findIndex(proc => proc.id === idProceso);
        if(index === -1) return this.printLoSentimos("Proceso no encontrado");
        const procesoAEliminar = this.listaDeProcesos[index];

        this.setBitRange(procesoAEliminar.indexInicio, procesoAEliminar.numeroBloquesOcupados, false); //Liberamos los bits marcandolos como libres en la "memoria"
        this.listaDeProcesos.splice(index, 1); //Eliminamos el proceso de la lista, es como un erase en c++
        return `Proceso ${procesoAEliminar.nombre} eliminado con éxito. ID: ${procesoAEliminar.id}`;
    }

    public obtenerEstadoVisual(): boolean[] {
        const estadoVisual: boolean[] = [];
        for(let i = 0; i < this.totalBloques; i++) {
            estadoVisual.push(this.checkBit(i));
        }
        return estadoVisual;
    }

    public obtenerListaDeProcesos(): Proceso[] {
        return this.listaDeProcesos;
    }

    public obtenerBloquesPorProceso(): Map<string, { nombre: string; color: string; bloques: number[] }> {
        const mapa = new Map();
        for (const proceso of this.listaDeProcesos) {
            const bloques: number[] = [];
            for (let i = 0; i < proceso.numeroBloquesOcupados; i++) {
                bloques.push(proceso.indexInicio + i);
            }
            mapa.set(proceso.id, {
                nombre: proceso.nombre,
                color: proceso.color,
                bloques: bloques
            });
        }
        return mapa;
    }

    public obtenerEstadisticas() {
        const estadoVisual = this.obtenerEstadoVisual();
        const bloquesOcupados = estadoVisual.filter(b => b).length;
        const bloquesLibres = estadoVisual.length - bloquesOcupados;
        
        return {
            memoriaTotal: this.memoriaTotal,
            tamanoBloque: this.tamanoBloque,
            totalBloques: this.totalBloques,
            bloquesOcupados,
            bloquesLibres,
            porcentajeOcupacion: ((bloquesOcupados / this.totalBloques) * 100).toFixed(2),
            memoryUsedBytes: bloquesOcupados * this.tamanoBloque,
            memoryFreeBytes: bloquesLibres * this.tamanoBloque
        };
    }
}
