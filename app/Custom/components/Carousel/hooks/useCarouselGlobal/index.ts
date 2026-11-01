import { useEffect, useState } from 'react'
import type { Location } from 'react-router'
import type { GallerySelection } from '../../CarouselDialog'
import { mountGallery } from '../../helpers/mountGallery'

export function useCarouselGlobal({ location }: { location: Location }) {
  const [selection, setSelection] = useState<GallerySelection | null>(null)

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main || !location.pathname) {
      return
    }
    const open = (image: HTMLImageElement) => {
      const images = Array.from(
        main.querySelectorAll<HTMLImageElement>(
          '.real-gallery .carousel-track img, .carousel-inner .carousel-track img',
        ),
      )
      const startIndex = images.indexOf(image)
      if (startIndex < 0) {
        return
      }
      const photos = images.map((img, position) => ({
        position,
        src:
          img.closest<HTMLAnchorElement>('a[href]')?.href ||
          img.currentSrc ||
          img.src,
        alt: img.alt || img.title,
      }))
      setSelection({ photos, startIndex })
    }

    const galleries = new Map<HTMLElement, () => void>()
    const sync = () => {
      for (const [gallery, cleanup] of galleries) {
        if (!main.contains(gallery)) {
          cleanup()
          galleries.delete(gallery)
        }
      }
      for (const gallery of main.querySelectorAll<HTMLElement>(
        '.real-gallery, .carousel-inner',
      )) {
        if (
          !galleries.has(gallery) &&
          gallery.querySelector(
            ':scope.real-gallery > figure, :scope.carousel-inner > .item img',
          )
        ) {
          galleries.set(gallery, mountGallery(gallery, open))
        }
      }
    }
    sync()
    const observer = new MutationObserver((records) => {
      if (
        records.some((record) =>
          [...record.addedNodes, ...record.removedNodes].some(
            (node) => node instanceof Element,
          ),
        )
      ) {
        sync()
      }
    })
    observer.observe(main, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      for (const cleanup of galleries.values()) {
        cleanup()
      }
      galleries.clear()
      setSelection(null)
    }
  }, [location.pathname])

  return { selection, close: () => setSelection(null) }
}
