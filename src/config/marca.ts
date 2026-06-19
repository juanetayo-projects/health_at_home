// Configuración de marca — Clínica Santa Bárbara
// Los logos se sirven desde public/images con el base path de Vite (dev y GitHub Pages).

const base = import.meta.env.BASE_URL

export const MARCA = {
  empresa: 'Clínica Santa Bárbara',
  subtitulo: 'Clínica de Alta Complejidad',
  aplicacion: 'Health at Home',
  descripcion: 'Gestión clínica domiciliaria',
  colorPrimario: '#1f5ba8',
  logoColor: `${base}images/logo_cacsb2.png`,
  logoBlanco: `${base}images/logo_cacsb_blanc.png`,
  dominio: 'cacsantabarbara.co',
} as const
