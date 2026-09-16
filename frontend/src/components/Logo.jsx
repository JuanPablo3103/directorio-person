// Marca de Adventure Works: el triángulo delantero de un cuadro de ruta,
// leído como una "A". Dos tubos (asiento y bajante) convergen en un punto
// donde antes se cruzaba el tubo superior (el travesaño de la "A"); desde
// ahí sobresale, en ámbar, el tubo de dirección — la única pieza de color
// de toda la identidad. Los ángulos de los tubos no son arbitrarios: el
// tubo de asiento y el tubo de dirección caen en los 73° que gobiernan
// todo el sistema (--angulo-marca); el bajante es más tendido (61°), como
// en un cuadro real, y esa asimetría es intencional, no un descuido.
//
// El trazo usa remates y uniones redondeadas (round) a propósito: es la
// única excepción a la regla de "nada blando" del sistema, porque un tubo
// de bicicleta real tiene sección circular. En cambio, en tamaños muy
// pequeños (favicon) los remates de los pies se eliminan por completo:
// a 16px un detalle así se convierte en ruido, no en información.

function Marca({ tamano = 32, favicon = false, className = '' }) {
  return (
    <svg
      width={tamano}
      height={tamano * (64 / 60)}
      viewBox="0 0 60 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Adventure Works"
    >
      {/* Pies de los tubos (dropouts): se omiten en el favicon. */}
      {!favicon && (
        <>
          <path d="M11 58h12" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M47 58h12" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </>
      )}

      {/* Tubo de asiento (izquierda, 73°) y bajante (derecha, 61°),
          convergiendo en (30, 16). El favicon usa trazo más grueso para
          seguir leyéndose nítido a tamaños diminutos. */}
      <path
        d="M17 58 30 16 53 58"
        stroke="currentColor"
        strokeWidth={favicon ? 7 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Travesaño (tubo superior): la barra de la "A". */}
      <path
        d="M23.2 38h18.8"
        stroke="currentColor"
        strokeWidth={favicon ? 7 : 5}
        strokeLinecap="round"
      />

      {/* Tubo de dirección: la única pieza en ámbar, continuando el ángulo
          de 73° del tubo de asiento más allá del punto de encuentro. */}
      <path
        d="M30 16 34 3"
        stroke="var(--color-reflectante)"
        strokeWidth={favicon ? 8 : 6}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Lockup completo: marca + nombre de la empresa, para el login y el pie
// del riel de navegación. El nombre del producto ("Directorio") no se
// mete en el logotipo: es un rótulo aparte, como en cualquier sistema de
// marca real donde el isologo corporativo no lleva el nombre de cada app.
//
// A propósito, ni la Marca ni el texto fijan su propio color acá adentro:
// lo heredan del className que reciba <Logo> desde afuera (currentColor
// en el SVG, color normal en el <span>). Si lo fijáramos en "text-texto"
// como color por defecto, cualquier lugar que use <Logo> sobre una
// superficie fija que NO seguía el tema (como el panel oscuro del login)
// heredaría mal el color y podría volverse invisible sobre su propio
// fondo — que es exactamente el bug que este comentario documenta.
function Logo({ tamano = 32, conNombre = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Marca tamano={tamano} className="shrink-0" />
      {conNombre && (
        <span className="font-display text-lg leading-none font-semibold tracking-tight">
          Adventure Works
        </span>
      )}
    </div>
  );
}

export { Marca };
export default Logo;
