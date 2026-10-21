import type { SeoHeadersProps } from '../../../../components/seo/SeoHeaders'

interface ImportedPageData {
  noindex?: boolean
  httpStatus?: number
  image?: SeoHeadersProps['image']
  redirect?: { location: string; status: number; noindex?: boolean }
}

export function importedPageData(value: unknown): ImportedPageData {
  if (!value || typeof value !== 'object') {
    return {}
  }
  const result: ImportedPageData = {}
  if ('noindex' in value && typeof value.noindex === 'boolean') {
    result.noindex = value.noindex
  }
  if (
    'httpStatus' in value &&
    typeof value.httpStatus === 'number' &&
    Number.isInteger(value.httpStatus) &&
    value.httpStatus >= 200 &&
    value.httpStatus < 500
  ) {
    result.httpStatus = value.httpStatus
  }
  if (
    'redirect' in value &&
    value.redirect &&
    typeof value.redirect === 'object'
  ) {
    const redirect = value.redirect
    if (
      'location' in redirect &&
      typeof redirect.location === 'string' &&
      /^(\/|https?:\/\/)/.test(redirect.location) &&
      'status' in redirect &&
      typeof redirect.status === 'number' &&
      [301, 302, 303, 307, 308].includes(redirect.status)
    ) {
      result.redirect = {
        location: redirect.location,
        status: redirect.status,
        noindex: 'noindex' in redirect && redirect.noindex === true,
      }
    }
  }
  if ('image' in value && value.image && typeof value.image === 'object') {
    const image = value.image
    if (
      'src' in image &&
      typeof image.src === 'string' &&
      'alt' in image &&
      typeof image.alt === 'string' &&
      'width' in image &&
      typeof image.width === 'number' &&
      'height' in image &&
      typeof image.height === 'number'
    ) {
      result.image = {
        src: image.src,
        alt: image.alt,
        width: image.width,
        height: image.height,
      }
    }
  }
  return result
}
