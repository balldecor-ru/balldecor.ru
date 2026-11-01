import { EnumValueConfigMap, SchemaTypes } from '@pothos/core'

export enum TemplateId {
  Empty = 0,
  Home = 1,
  Gallery = 2,
  News = 4,
  Services = 5,
  Article = 7,
  PriceList = 8,
  Contacts = 9,
  About = 10,
  PrintPriceList = 11,
  Palette = 14,
  Main = 15,
  LegacyGalleryItem = 16,
  PriceItem = 17,
  ServiceGalleryItem = 18,
  ContactsCopy = 19,
  HomeCopy = 20,
  NewsCopy = 21,
  AboutCopy = 22,
  PaletteCopy = 23,
  PriceListCopy = 24,
  PrintPriceListCopy = 25,
  ServicesCopy = 26,
  GalleryItem = 27,
  GalleryCategory = 28,
  ServiceCategory = 29,
  Category = 30,
  Product = 31,
  Currency = 32,
  ServiceGallery = 33,
  FullGalleryItem = 34,
  PersonalAccount = 35,
  MainWithAccountAndCart = 36,
}

export const CustomKbConceptType = {
  OldPage0ModDocument: {
    value: `old:page:${TemplateId.Empty}:modDocument`,
    description: 'Empty template',
  },
  OldPage1ModDocument: {
    value: `old:page:${TemplateId.Home}:modDocument`,
    description: 'Главная',
  },
  OldPage2ModDocument: {
    value: `old:page:${TemplateId.Gallery}:modDocument`,
    description: 'Галерея',
  },
  OldPage4ModDocument: {
    value: `old:page:${TemplateId.News}:modDocument`,
    description: 'Новости',
  },
  OldPage5ModDocument: {
    value: `old:page:${TemplateId.Services}:modDocument`,
    description: 'Услуги',
  },
  OldPage7ModDocument: {
    value: `old:page:${TemplateId.Article}:modDocument`,
    description: 'Статья',
  },
  OldPage8ModDocument: {
    value: `old:page:${TemplateId.PriceList}:modDocument`,
    description: 'Прайслист',
  },
  OldPage9ModDocument: {
    value: `old:page:${TemplateId.Contacts}:modDocument`,
    description: 'Контакты',
  },
  OldPage10ModDocument: {
    value: `old:page:${TemplateId.About}:modDocument`,
    description: 'О нас',
  },
  OldPage11ModDocument: {
    value: `old:page:${TemplateId.PrintPriceList}:modDocument`,
    description: 'Прайслист-печать',
  },
  OldPage14ModDocument: {
    value: `old:page:${TemplateId.Palette}:modDocument`,
    description: 'Палитра',
  },
  OldPage15ModDocument: {
    value: `old:page:${TemplateId.Main}:modDocument`,
    description: 'Основной',
  },
  OldPage17ModDocument: {
    value: `old:page:${TemplateId.PriceItem}:modDocument`,
    description: 'Прайс-элемент',
  },
  OldPage18ModDocument: {
    value: `old:page:${TemplateId.ServiceGalleryItem}:modDocument`,
    description: 'Услуга-Элемент-Галерея',
  },
  OldPage27ModDocument: {
    value: `old:page:${TemplateId.GalleryItem}:modDocument`,
    description: 'Gallery item',
  },
  OldPage28ModDocument: {
    value: `old:page:${TemplateId.GalleryCategory}:modDocument`,
    description: 'Галерея-категория',
  },
  OldPage29ModDocument: {
    value: `old:page:${TemplateId.ServiceCategory}:modDocument`,
    description: 'Услуга Категория',
  },
  OldPage30ModDocument: {
    value: `old:page:${TemplateId.Category}:modDocument`,
    description: 'Категория',
  },
  OldPage31ModDocument: {
    value: `old:page:${TemplateId.Product}:modDocument`,
    description: 'Товар',
  },
  OldPage33ModDocument: {
    value: `old:page:${TemplateId.ServiceGallery}:modDocument`,
    description: 'Услуга-Галерея',
  },
  OldPage34ModDocument: {
    value: `old:page:${TemplateId.FullGalleryItem}:modDocument`,
    description: 'Галерея-элемент (полный)',
  },
  OldPage35ModDocument: {
    value: `old:page:${TemplateId.PersonalAccount}:modDocument`,
    description: 'Личный кабинет',
  },
  OldPage36ModDocument: {
    value: `old:page:${TemplateId.MainWithAccountAndCart}:modDocument`,
    description: 'Основной с ЛК и корзиной',
  },
} as const satisfies EnumValueConfigMap<SchemaTypes>
