import { toUnicode } from 'punycode/punycode.es6.js'

export const decodeStatisticsDomain = (hostname: string): string => {
  try {
    return toUnicode(hostname) || hostname
  } catch {
    return hostname
  }
}

export const decodeStatisticsUrl = (value: string): string => {
  try {
    const url: URL = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return value
    }
    const hostname: string = decodeStatisticsDomain(url.hostname)
    if (hostname === url.hostname) {
      return value
    }
    const credentials: string =
      url.username || url.password
        ? `${url.username}${url.password ? `:${url.password}` : ''}@`
        : ''
    const port: string = url.port ? `:${url.port}` : ''
    // URL.hostname setters and URL.href serialize Unicode hosts back to punycode.
    // Keep the parsed URL components encoded and substitute only the hostname.
    return `${url.protocol}//${credentials}${hostname}${port}${url.pathname}${url.search}${url.hash}`
  } catch {
    // Parsing or decoding must never interrupt visit collection.
    return value
  }
}
