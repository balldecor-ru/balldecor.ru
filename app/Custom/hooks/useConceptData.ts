import { KbConceptFragment } from 'app/gql/generated'
import { getResizedImagePath } from '../helpers/getResizedImagePath'
import { useMemo } from 'react'

export type ConceptData = ReturnType<typeof useConceptData>

type useConceptDataProps = {
  concept: KbConceptFragment
}

export function useConceptData({ concept }: useConceptDataProps) {
  return useMemo(() => {
    const { image } = concept

    return {
      imageSrc: image
        ? getResizedImagePath({
            path: image,
            size: 'middle',
          })
        : null,
    }
  }, [concept])
}
