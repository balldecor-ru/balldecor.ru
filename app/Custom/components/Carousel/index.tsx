import { Children, useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { CarouselStyled } from './styles'

type CarouselProps = {
  children: React.ReactNode
  label: string
}

export const Carousel: React.FC<CarouselProps> = ({ children, label }) => {
  const [viewport, api] = useEmblaCarousel({ align: 'start' })
  const [navigation, setNavigation] = useState({
    index: 0,
    count: 0,
    previous: false,
    next: false,
  })

  useEffect(() => {
    if (!api) {
      return
    }
    const update = () => {
      setNavigation({
        index: api.selectedScrollSnap(),
        count: api.scrollSnapList().length,
        previous: api.canScrollPrev(),
        next: api.canScrollNext(),
      })
    }
    api.on('select', update).on('reInit', update)
    update()
    return () => {
      api.off('select', update).off('reInit', update)
    }
  }, [api])

  const previous = useCallback(() => api?.scrollPrev(), [api])
  const next = useCallback(() => api?.scrollNext(), [api])

  return (
    <CarouselStyled
      role="region"
      aria-label={label}
      aria-roledescription="карусель"
    >
      <div className="carousel-viewport" ref={viewport}>
        <div className="carousel-track">
          {Children.map(children, (child) =>
            child ? <div className="item">{child}</div> : null,
          )}
        </div>
      </div>
      {navigation.count > 1 && (
        <div className="carousel-controls">
          <button
            type="button"
            aria-label="Предыдущий слайд"
            disabled={!navigation.previous}
            onClick={previous}
          />
          <span aria-live="polite">
            {navigation.index + 1} / {navigation.count}
          </span>
          <button
            type="button"
            aria-label="Следующий слайд"
            disabled={!navigation.next}
            onClick={next}
          />
        </div>
      )}
    </CarouselStyled>
  )
}
