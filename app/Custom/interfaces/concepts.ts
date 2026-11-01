import { KbConceptFragment } from 'app/gql/generated'
import { CustomKbConceptType } from './conceptType'

export const CustomKbConceptTypeValues = Object.values(CustomKbConceptType).map(
  (n) => n.value,
)

export type CustomKbConceptTypeKey = keyof typeof CustomKbConceptType

export type CustomKbConceptTypeValue =
  (typeof CustomKbConceptType)[CustomKbConceptTypeKey]['value']

export type KbConceptEmptyFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage0ModDocument.value
}

export function isKbConceptEmptyFragment(
  object: KbConceptFragment,
): object is KbConceptEmptyFragment {
  const valid = object.type === CustomKbConceptType.OldPage0ModDocument.value

  return valid
}

export type KbConceptHomeFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage1ModDocument.value
}

export function isKbConceptHomeFragment(
  object: KbConceptFragment,
): object is KbConceptHomeFragment {
  const valid = object.type === CustomKbConceptType.OldPage1ModDocument.value

  return valid
}

export type KbConceptGalleryFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage2ModDocument.value
}

export function isKbConceptGalleryFragment(
  object: KbConceptFragment,
): object is KbConceptGalleryFragment {
  const valid = object.type === CustomKbConceptType.OldPage2ModDocument.value

  return valid
}

export type KbConceptNewsFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage4ModDocument.value
}

export function isKbConceptNewsFragment(
  object: KbConceptFragment,
): object is KbConceptNewsFragment {
  const valid = object.type === CustomKbConceptType.OldPage4ModDocument.value

  return valid
}

export type KbConceptServicesFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage5ModDocument.value
}

export function isKbConceptServicesFragment(
  object: KbConceptFragment,
): object is KbConceptServicesFragment {
  const valid = object.type === CustomKbConceptType.OldPage5ModDocument.value

  return valid
}

export type KbConceptArticleFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage7ModDocument.value
}

export function isKbConceptArticleFragment(
  object: KbConceptFragment,
): object is KbConceptArticleFragment {
  const valid = object.type === CustomKbConceptType.OldPage7ModDocument.value

  return valid
}

export type KbConceptPriceListFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage8ModDocument.value
}

export function isKbConceptPriceListFragment(
  object: KbConceptFragment,
): object is KbConceptPriceListFragment {
  const valid = object.type === CustomKbConceptType.OldPage8ModDocument.value

  return valid
}

export type KbConceptContactsFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage9ModDocument.value
}

export function isKbConceptContactsFragment(
  object: KbConceptFragment,
): object is KbConceptContactsFragment {
  const valid = object.type === CustomKbConceptType.OldPage9ModDocument.value

  return valid
}

export type KbConceptAboutFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage10ModDocument.value
}

export function isKbConceptAboutFragment(
  object: KbConceptFragment,
): object is KbConceptAboutFragment {
  const valid = object.type === CustomKbConceptType.OldPage10ModDocument.value

  return valid
}

export type KbConceptPrintPriceListFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage11ModDocument.value
}

export function isKbConceptPrintPriceListFragment(
  object: KbConceptFragment,
): object is KbConceptPrintPriceListFragment {
  const valid = object.type === CustomKbConceptType.OldPage11ModDocument.value

  return valid
}

export type KbConceptPaletteFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage14ModDocument.value
}

export function isKbConceptPaletteFragment(
  object: KbConceptFragment,
): object is KbConceptPaletteFragment {
  const valid = object.type === CustomKbConceptType.OldPage14ModDocument.value

  return valid
}

export type KbConceptMainFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage15ModDocument.value
}

export function isKbConceptMainFragment(
  object: KbConceptFragment,
): object is KbConceptMainFragment {
  const valid = object.type === CustomKbConceptType.OldPage15ModDocument.value

  return valid
}

export type KbConceptPriceItemFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage17ModDocument.value
}

export function isKbConceptPriceItemFragment(
  object: KbConceptFragment,
): object is KbConceptPriceItemFragment {
  const valid = object.type === CustomKbConceptType.OldPage17ModDocument.value

  return valid
}

export type KbConceptServiceGalleryItemFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage18ModDocument.value
}

export function isKbConceptServiceGalleryItemFragment(
  object: KbConceptFragment,
): object is KbConceptServiceGalleryItemFragment {
  const valid = object.type === CustomKbConceptType.OldPage18ModDocument.value

  return valid
}

export type KbConceptGalleryItemFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage27ModDocument.value
}

export function isKbConceptGalleryItemFragment(
  object: KbConceptFragment,
): object is KbConceptGalleryItemFragment {
  const valid = object.type === CustomKbConceptType.OldPage27ModDocument.value

  return valid
}

export type KbConceptGalleryCategoryFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage28ModDocument.value
}

export function isKbConceptGalleryCategoryFragment(
  object: KbConceptFragment,
): object is KbConceptGalleryCategoryFragment {
  const valid = object.type === CustomKbConceptType.OldPage28ModDocument.value

  return valid
}

export type KbConceptServiceCategoryFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage29ModDocument.value
}

export function isKbConceptServiceCategoryFragment(
  object: KbConceptFragment,
): object is KbConceptServiceCategoryFragment {
  const valid = object.type === CustomKbConceptType.OldPage29ModDocument.value

  return valid
}

export type KbConceptCategoryFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage30ModDocument.value
}

export function isKbConceptCategoryFragment(
  object: KbConceptFragment,
): object is KbConceptCategoryFragment {
  const valid = object.type === CustomKbConceptType.OldPage30ModDocument.value

  return valid
}

export type KbConceptProductFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage31ModDocument.value
}

export function isKbConceptProductFragment(
  object: KbConceptFragment,
): object is KbConceptProductFragment {
  const valid = object.type === CustomKbConceptType.OldPage31ModDocument.value

  return valid
}

export type KbConceptServiceGalleryFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage33ModDocument.value
}

export function isKbConceptServiceGalleryFragment(
  object: KbConceptFragment,
): object is KbConceptServiceGalleryFragment {
  const valid = object.type === CustomKbConceptType.OldPage33ModDocument.value

  return valid
}

export type KbConceptFullGalleryItemFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage34ModDocument.value
}

export function isKbConceptFullGalleryItemFragment(
  object: KbConceptFragment,
): object is KbConceptFullGalleryItemFragment {
  const valid = object.type === CustomKbConceptType.OldPage34ModDocument.value

  return valid
}

export type KbConceptPersonalAccountFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage35ModDocument.value
}

export function isKbConceptPersonalAccountFragment(
  object: KbConceptFragment,
): object is KbConceptPersonalAccountFragment {
  const valid = object.type === CustomKbConceptType.OldPage35ModDocument.value

  return valid
}

export type KbConceptMainWithAccountAndCartFragment = KbConceptFragment & {
  type: typeof CustomKbConceptType.OldPage36ModDocument.value
}

export function isKbConceptMainWithAccountAndCartFragment(
  object: KbConceptFragment,
): object is KbConceptMainWithAccountAndCartFragment {
  const valid = object.type === CustomKbConceptType.OldPage36ModDocument.value

  return valid
}
