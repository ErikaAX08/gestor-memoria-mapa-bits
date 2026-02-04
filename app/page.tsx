"use client";

import { useState } from "react";
import { GestorMemoria, type AlgoritmoAsignacion } from "./GestorMemoria";

interface Proceso {
  id: string;
  nombre: string;
  tamano: number;
  indexInicio: number;
  numeroBloquesOcupados: number;
  color: string;
}

const COLORES_DISPONIBLES = [
  "#3B82F6", // azul
  "#EF4444", // rojo
  "#10B981", // verde
  "#F59E0B", // amarillo
  "#8B5CF6", // púrpura
  "#EC4899", // rosa
  "#14B8A6", // teal
  "#F97316", // naranja
  "#06B6D4", // cyan
  "#6366F1", // índigo
];

export default function Home() {
  const [gestor, setGestor] = useState<GestorMemoria | null>(null);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [estadoVisual, setEstadoVisual] = useState<boolean[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  // Form state
  const [nombre, setNombre] = useState("");
  const [tamano, setTamano] = useState("");
  const [algoritmo, setAlgoritmo] = useState<AlgoritmoAsignacion>("first");

  // Configuración inicial
  const [memoriaTotal, setMemoriaTotal] = useState(2048);
  const [tamanoBloque, setTamanoBloque] = useState(128);
  const [configurado, setConfigurado] = useState(false);

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalBloques: 0,
    bloquesOcupados: 0,
    bloquesLibres: 0,
    porcentajeOcupacion: "0",
    memoryUsedBytes: 0,
    memoryFreeBytes: 0,
  });

  const inicializarGestor = () => {
    const nuevoGestor = new GestorMemoria(memoriaTotal, tamanoBloque);
    setGestor(nuevoGestor);
    setProcesos([]);
    setEstadoVisual(nuevoGestor.obtenerEstadoVisual());
    const stats = nuevoGestor.obtenerEstadisticas();
    setEstadisticas({
      totalBloques: stats.totalBloques,
      bloquesOcupados: stats.bloquesOcupados,
      bloquesLibres: stats.bloquesLibres,
      porcentajeOcupacion: stats.porcentajeOcupacion,
      memoryUsedBytes: stats.memoryUsedBytes,
      memoryFreeBytes: stats.memoryFreeBytes,
    });
    setConfigurado(true);
    setMensaje("Gestor de memoria inicializado");
  };

  const crearProceso = () => {
    if (!gestor) return;
    if (!nombre.trim() || !tamano) {
      setMensaje("Por favor completa el nombre y tamaño");
      return;
    }

    const tamanoBytesNum = parseInt(tamano);
    const color = COLORES_DISPONIBLES[colorIdx % COLORES_DISPONIBLES.length];

    const resultado = gestor.crearProceso(nombre, tamanoBytesNum, color, algoritmo);
    setMensaje(resultado);

    if (!resultado.includes("Lo sentimos")) {
      setProcesos([...gestor.obtenerListaDeProcesos()]);
      setEstadoVisual(gestor.obtenerEstadoVisual());
      const stats = gestor.obtenerEstadisticas();
      setEstadisticas({
        totalBloques: stats.totalBloques,
        bloquesOcupados: stats.bloquesOcupados,
        bloquesLibres: stats.bloquesLibres,
        porcentajeOcupacion: stats.porcentajeOcupacion,
        memoryUsedBytes: stats.memoryUsedBytes,
        memoryFreeBytes: stats.memoryFreeBytes,
      });
      setColorIdx(colorIdx + 1);
      setNombre("");
      setTamano("");
    }
  };

  const eliminarProceso = (idProceso: string) => {
    if (!gestor) return;
    const resultado = gestor.eliminarProceso(idProceso);
    setMensaje(resultado);

    setProcesos([...gestor.obtenerListaDeProcesos()]);
    setEstadoVisual(gestor.obtenerEstadoVisual());
    const stats = gestor.obtenerEstadisticas();
    setEstadisticas({
      totalBloques: stats.totalBloques,
      bloquesOcupados: stats.bloquesOcupados,
      bloquesLibres: stats.bloquesLibres,
      porcentajeOcupacion: stats.porcentajeOcupacion,
      memoryUsedBytes: stats.memoryUsedBytes,
      memoryFreeBytes: stats.memoryFreeBytes,
    });
  };

  const obtenerColorProceso = (indice: number): string | null => {
    for (const proceso of procesos) {
      if (
        indice >= proceso.indexInicio &&
        indice < proceso.indexInicio + proceso.numeroBloquesOcupados
      ) {
        return proceso.color;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestor de Memoria - Mapa de Bits</h1>
          <p className="text-gray-300">Práctica 2 - Sistemas Operativos II</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Control */}
          <div className="lg:col-span-1">
            <div className="bg-slate-700 rounded-lg p-6 space-y-6">
              {/* Configuración Inicial */}
              {!configurado && (
                <div className="space-y-4 pb-6 border-b border-slate-600">
                  <h2 className="text-xl font-semibold">Configuración</h2>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Memoria Total (bytes):
                    </label>
                    <input
                      type="number"
                      value={memoriaTotal}
                      onChange={(e) => setMemoriaTotal(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tamaño de Bloque (bytes):
                    </label>
                    <input
                      type="number"
                      value={tamanoBloque}
                      onChange={(e) => setTamanoBloque(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                    />
                  </div>
                  <button
                    onClick={inicializarGestor}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition"
                  >
                    Inicializar
                  </button>
                </div>
              )}

              {/* Crear Proceso */}
              {configurado && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Crear Proceso</h2>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre:</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="P1"
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tamaño (bytes):</label>
                    <input
                      type="number"
                      value={tamano}
                      onChange={(e) => setTamano(e.target.value)}
                      placeholder="256"
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Algoritmo:</label>
                    <select
                      value={algoritmo}
                      onChange={(e) => setAlgoritmo(e.target.value as AlgoritmoAsignacion)}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                    >
                      <option value="first">First Fit</option>
                      <option value="next">Next Fit</option>
                      <option value="best">Best Fit</option>
                      <option value="worst">Worst Fit</option>
                    </select>
                  </div>
                  <button
                    onClick={crearProceso}
                    className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition"
                  >
                    Crear Proceso
                  </button>
                </div>
              )}

              {/* Mensaje */}
              {mensaje && (
                <div className={`p-3 rounded text-sm ${
                  mensaje.includes("Lo sentimos")
                    ? "bg-red-600/20 text-red-200"
                    : "bg-green-600/20 text-green-200"
                }`}>
                  {mensaje}
                </div>
              )}
            </div>
          </div>

          {/* Panel Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estadísticas */}
            {configurado && (
              <div className="bg-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-600 p-4 rounded">
                    <div className="text-gray-400 text-sm">Total Bloques</div>
                    <div className="text-2xl font-bold">{estadisticas.totalBloques}</div>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <div className="text-gray-400 text-sm">Bloques Ocupados</div>
                    <div className="text-2xl font-bold text-red-400">{estadisticas.bloquesOcupados}</div>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <div className="text-gray-400 text-sm">Bloques Libres</div>
                    <div className="text-2xl font-bold text-green-400">{estadisticas.bloquesLibres}</div>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <div className="text-gray-400 text-sm">Ocupación</div>
                    <div className="text-2xl font-bold">{estadisticas.porcentajeOcupacion}%</div>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <div className="text-gray-400 text-sm">Usado</div>
                    <div className="text-lg font-bold">{estadisticas.memoryUsedBytes} B</div>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <div className="text-gray-400 text-sm">Libre</div>
                    <div className="text-lg font-bold">{estadisticas.memoryFreeBytes} B</div>
                  </div>
                </div>
              </div>
            )}

            {/* Mapa de Bits */}
            {configurado && (
              <div className="bg-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Mapa de Bits (Memoria Visual)</h2>
                <div className="bg-slate-800 p-4 rounded overflow-auto max-h-64">
                  <div className="flex flex-wrap gap-1">
                    {estadoVisual.map((ocupado, idx) => {
                      const color = ocupado ? obtenerColorProceso(idx) : null;
                      return (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded border border-gray-600 transition-all hover:scale-110 cursor-pointer"
                          style={{
                            backgroundColor: color || (ocupado ? "#666" : "transparent"),
                          }}
                          title={`Bloque ${idx} - ${ocupado ? "Ocupado" : "Libre"}`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    Total: {estadoVisual.length} bloques
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Procesos Activos */}
        {configurado && (
          <div className="mt-6 bg-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Procesos Activos</h2>
            {procesos.length === 0 ? (
              <p className="text-gray-400">No hay procesos creados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-2 px-4">Nombre</th>
                      <th className="text-left py-2 px-4">ID</th>
                      <th className="text-left py-2 px-4">Tamaño</th>
                      <th className="text-left py-2 px-4">Índice</th>
                      <th className="text-left py-2 px-4">Bloques</th>
                      <th className="text-left py-2 px-4">Color</th>
                      <th className="text-left py-2 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procesos.map((proceso) => (
                      <tr key={proceso.id} className="border-b border-slate-600 hover:bg-slate-600/50">
                        <td className="py-3 px-4 font-medium">{proceso.nombre}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{proceso.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4">{proceso.tamano} B</td>
                        <td className="py-3 px-4">{proceso.indexInicio}</td>
                        <td className="py-3 px-4">{proceso.numeroBloquesOcupados}</td>
                        <td className="py-3 px-4">
                          <div
                            className="w-8 h-8 rounded border-2 border-gray-400"
                            style={{ backgroundColor: proceso.color }}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => eliminarProceso(proceso.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
