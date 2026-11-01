import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { CarouselDialogStyled } from '../styles'

export interface GallerySelection {
  photos: { position: number; src: string; alt: string }[]
  startIndex: number
}

export function CarouselDialog({
  photos,
  startIndex,
  onClose,
}: GallerySelection & { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [viewport, api] = useEmblaCarousel({ startIndex })
  const [index, setIndex] = useState(startIndex)

  useLayoutEffect(() => {
    dialog.current?.showModal()
  }, [])

  useEffect(() => {
    if (!api) {
      return
    }
    const update = () => setIndex(api.selectedScrollSnap())
    api.on('select', update).on('reInit', update)
    return () => {
      api.off('select', update).off('reInit', update)
    }
  }, [api])

  const previous = useCallback(() => api?.scrollPrev(), [api])
  const next = useCallback(() => api?.scrollNext(), [api])

  return (
    <CarouselDialogStyled
      ref={dialog}
      onClose={onClose}
      aria-label="Фотогалерея"
    >
      <div
        className="viewport"
        ref={viewport}
        style={{ visibility: api ? 'visible' : 'hidden' }}
      >
        <div className="track">
          {photos.map(({ src, alt, position }) => (
            <img key={position} src={src} alt={alt} draggable={false} />
          ))}
        </div>
      </div>
      {photos.length > 1 && (
        <div className="controls">
          <button
            aria-label="Предыдущее фото"
            disabled={index === 0}
            onClick={previous}
          >
            ‹
          </button>
          <span aria-live="polite">
            {index + 1} / {photos.length}
          </span>
          <button
            aria-label="Следующее фото"
            disabled={index === photos.length - 1}
            onClick={next}
          >
            ›
          </button>
        </div>
      )}
      <form method="dialog">
        <button aria-label="Закрыть">×</button>
      </form>
    </CarouselDialogStyled>
  )
}
