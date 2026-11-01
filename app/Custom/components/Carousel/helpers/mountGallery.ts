import EmblaCarousel from 'embla-carousel'
import { carouselClassStyles } from '../styles'

export function mountGallery(
  gallery: HTMLElement,
  open: (image: HTMLImageElement) => void,
) {
  const viewport = document.createElement('div')
  const track = document.createElement('div')
  viewport.className = 'carousel-viewport'
  track.className = 'carousel-track'
  track.append(...Array.from(gallery.childNodes))
  viewport.append(track)
  gallery.append(viewport)
  gallery.classList.add(carouselClassStyles)

  const api = EmblaCarousel(viewport)
  const controls = document.createElement('div')
  controls.className = 'carousel-controls'
  const previous = document.createElement('button')
  previous.type = 'button'
  previous.setAttribute('aria-label', 'Предыдущее фото')
  const next = document.createElement('button')
  next.type = 'button'
  next.setAttribute('aria-label', 'Следующее фото')
  const counter = document.createElement('span')
  counter.setAttribute('aria-live', 'polite')
  controls.append(previous, next, counter)

  const update = () => {
    const index = api.selectedScrollSnap()
    const image = api.slideNodes()[index]?.querySelector('img')
    if (image?.naturalHeight) {
      gallery.style.setProperty(
        '--photo-ratio',
        String(image.naturalWidth / image.naturalHeight),
      )
    }
    const count = api.scrollSnapList().length
    if (count > 1) {
      if (!controls.parentNode) {
        gallery.append(controls)
      }
      previous.disabled = !api.canScrollPrev()
      next.disabled = !api.canScrollNext()
      counter.textContent = `${index + 1} / ${count}`
    } else {
      controls.remove()
    }
  }

  const listeners = new AbortController()
  const { signal } = listeners
  previous.addEventListener('click', () => api.scrollPrev(), { signal })
  next.addEventListener('click', () => api.scrollNext(), { signal })
  viewport.addEventListener('load', update, { capture: true, signal })
  viewport.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof HTMLImageElement && !event.defaultPrevented) {
        event.preventDefault()
        event.stopPropagation()
        open(event.target)
      }
    },
    { signal },
  )
  api.on('select', update).on('reInit', update)
  update()

  return () => {
    listeners.abort()
    api.destroy()
    controls.remove()
    viewport.replaceWith(...Array.from(track.childNodes))
    gallery.classList.remove(carouselClassStyles)
    gallery.style.removeProperty('--photo-ratio')
  }
}
