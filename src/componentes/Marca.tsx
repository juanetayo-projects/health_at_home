import { MARCA } from '@/config/marca'

interface Props {
  variante?: 'color' | 'blanco'
  className?: string
}

/** Logotipo de la Clínica Santa Bárbara. */
export function Marca({ variante = 'color', className = 'h-12' }: Props) {
  const src = variante === 'blanco' ? MARCA.logoBlanco : MARCA.logoColor
  return <img src={src} alt={`${MARCA.empresa} — ${MARCA.subtitulo}`} className={className} />
}
