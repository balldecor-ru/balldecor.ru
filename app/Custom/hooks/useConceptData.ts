import { KbConceptFragment } from 'app/gql/generated'
import { getResizedImagePath } from '../helpers/getResizedImagePath'
import { useMemo } from 'react'
import { ModxTvId } from '../interfaces'

export type ConceptData = ReturnType<typeof useConceptData>

type useConceptDataProps = {
  concept: KbConceptFragment
}

export function useConceptData({ concept }: useConceptDataProps) {
  const { tv } = concept

  return useMemo(() => {
    const values = tv as { tmplvarid: number; value: string }[] | null
    const getValue = (id: ModxTvId) =>
      values?.find((item) => item.tmplvarid === id)?.value

    const getBoolean = (id: ModxTvId) => {
      const value = getValue(id)
      return value === '1' ? true : value === '0' ? false : null
    }

    const image = getValue(ModxTvId.image)
    const rawPackCount = getValue(ModxTvId.pack_count)?.trim()
    const packCount =
      rawPackCount && /^\d+$/.test(rawPackCount) ? Number(rawPackCount) : NaN

    return {
      addTitle: getBoolean(ModxTvId.add_title),
      packCount: Number.isSafeInteger(packCount) ? packCount : null,
      size: getValue(ModxTvId.size) ?? null,
      available: getBoolean(ModxTvId.available),
      imageSrc: image
        ? getResizedImagePath({
            path: image,
            size: 'middle',
          })
        : null,
    }
  }, [tv])
}
