import { useEffect, useRef } from 'react'
import type { Location } from 'react-router'
import { mountGallery } from '../../helpers/mountGallery'

export function useCarouselGlobal({ location }: { location: Location }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const preview = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const main = document.getElementById('main-content')
    const element = dialog.current
    const photo = preview.current
    if (!main || !element || !photo || !location.pathname) {
      return
    }
    const open = (image: HTMLImageElement) => {
      photo.src =
        image.closest<HTMLAnchorElement>('a[href]')?.href ||
        image.currentSrc ||
        image.src
      photo.alt = image.alt || image.title
      element.showModal()
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
        '.real-gallery',
      )) {
        if (
          !galleries.has(gallery) &&
          gallery.querySelector(':scope > figure')
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
      element.close()
    }
  }, [location.pathname])

  return { dialog, preview }
}
