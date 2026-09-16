// Traduce el código de dos letras de la columna PersonType a una
// descripción legible en español. Compartido entre el listado (columna
// "tipo" y filtro) y la ficha de detalle, para no duplicar el diccionario.

export const ETIQUETAS_TIPO = {
  EM: 'Empleado',
  SP: 'Vendedor',
  SC: 'Contacto de tienda',
  IN: 'Cliente individual',
  VC: 'Contacto de proveedor',
  GC: 'Contacto general'
};

// Clases de color por tipo, usadas por el componente Insignia para dar
// una referencia visual rápida en el listado y el detalle.
export const COLORES_TIPO = {
  EM: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  SP: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  SC: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  IN: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  VC: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  GC: 'bg-slate-100 text-slate-700 ring-slate-600/20'
};

// Opciones para el <select> de filtro del listado: "Todos" más una
// entrada por cada tipo, derivadas del mismo diccionario de arriba.
export const OPCIONES_TIPO = [
  { valor: '', etiqueta: 'Todos' },
  ...Object.entries(ETIQUETAS_TIPO).map(([valor, etiqueta]) => ({ valor, etiqueta }))
];