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

// Opciones para el <select> de filtro del listado: "Todos" más una
// entrada por cada tipo, derivadas del mismo diccionario de arriba.
export const OPCIONES_TIPO = [
  { valor: '', etiqueta: 'Todos' },
  ...Object.entries(ETIQUETAS_TIPO).map(([valor, etiqueta]) => ({ valor, etiqueta }))
];
