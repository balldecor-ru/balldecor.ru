/* eslint-disable no-console */
import type React from 'react'
import { useConceptActions } from 'app/Custom/hooks/useConceptActions'
import { Link } from 'react-router'
import type { KbConceptFragment } from 'app/gql/generated'
import { CustomLayoutSectionStyled } from '../../Layout/styles'
import { Hast } from '../Hast'
import { Markdown } from '../Markdown'
import { ConceptGallery } from '../Gallery'
import {
  ConceptPageStyled,
  ConceptHeadingStyled,
  ConceptContentStyled,
} from './styles'
import {
  CustomKbConceptTypeValues,
  isKbConceptEmptyFragment,
  isKbConceptHomeFragment,
  isKbConceptGalleryFragment,
  isKbConceptNewsFragment,
  isKbConceptServicesFragment,
  isKbConceptArticleFragment,
  isKbConceptPriceListFragment,
  isKbConceptContactsFragment,
  isKbConceptAboutFragment,
  isKbConceptPrintPriceListFragment,
  isKbConceptPaletteFragment,
  isKbConceptMainFragment,
  isKbConceptPriceItemFragment,
  isKbConceptServiceGalleryItemFragment,
  isKbConceptGalleryItemFragment,
  isKbConceptGalleryCategoryFragment,
  isKbConceptServiceCategoryFragment,
  isKbConceptCategoryFragment,
  isKbConceptProductFragment,
  isKbConceptServiceGalleryFragment,
  isKbConceptFullGalleryItemFragment,
  isKbConceptPersonalAccountFragment,
  isKbConceptMainWithAccountAndCartFragment,
} from 'app/Custom/interfaces/concepts'
import { EmptyConceptView } from './ByType/Empty'
import { HomeConceptView } from './ByType/Home'
import { GalleryConceptView } from './ByType/Gallery'
import { NewsConceptView } from './ByType/News'
import { ServicesConceptView } from './ByType/Services'
import { ArticleConceptView } from './ByType/Article'
import { PriceListConceptView } from './ByType/PriceList'
import { ContactsConceptView } from './ByType/Contacts'
import { AboutConceptView } from './ByType/About'
import { PrintPriceListConceptView } from './ByType/PrintPriceList'
import { PaletteConceptView } from './ByType/Palette'
import { MainConceptView } from './ByType/Main'
import { PriceItemConceptView } from './ByType/PriceItem'
import { ServiceGalleryItemConceptView } from './ByType/ServiceGalleryItem'
import { GalleryItemConceptView } from './ByType/GalleryItem'
import { GalleryCategoryConceptView } from './ByType/GalleryCategory'
import { ServiceCategoryConceptView } from './ByType/ServiceCategory'
import { CategoryConceptView } from './ByType/Category'
import { ProductConceptView } from './ByType/Product'
import { ServiceGalleryConceptView } from './ByType/ServiceGallery'
import { FullGalleryItemConceptView } from './ByType/FullGalleryItem'
import { PersonalAccountConceptView } from './ByType/PersonalAccount'
import { MainWithAccountAndCartConceptView } from './ByType/MainWithAccountAndCart'

export const ConceptItem: React.FC<{
  concept: KbConceptFragment
  variant: 'full' | 'short'
}> = ({ concept, variant }) => {
  console.log('concept', concept)

  if (variant === 'short') {
    return <Link to={concept.uri}>{concept.name}</Link>
  }

  return <FullConceptItem concept={concept} />
}

const FullConceptItem: React.FC<{ concept: KbConceptFragment }> = ({
  concept,
}) => {
  const actions = useConceptActions(concept.id)
  let content: React.ReactNode

  switch (true) {
    case isKbConceptEmptyFragment(concept):
      content = <EmptyConceptView concept={concept} />
      break

    case isKbConceptHomeFragment(concept):
      content = <HomeConceptView concept={concept} />
      break

    case isKbConceptGalleryFragment(concept):
      content = <GalleryConceptView concept={concept} />
      break

    case isKbConceptNewsFragment(concept):
      content = <NewsConceptView concept={concept} />
      break

    case isKbConceptServicesFragment(concept):
      content = <ServicesConceptView concept={concept} />
      break

    case isKbConceptArticleFragment(concept):
      content = <ArticleConceptView concept={concept} />
      break

    case isKbConceptPriceListFragment(concept):
      content = <PriceListConceptView concept={concept} />
      break

    case isKbConceptContactsFragment(concept):
      content = <ContactsConceptView concept={concept} />
      break

    case isKbConceptAboutFragment(concept):
      content = <AboutConceptView concept={concept} />
      break

    case isKbConceptPrintPriceListFragment(concept):
      content = <PrintPriceListConceptView concept={concept} />
      break

    case isKbConceptPaletteFragment(concept):
      content = <PaletteConceptView concept={concept} />
      break

    case isKbConceptMainFragment(concept):
      content = <MainConceptView concept={concept} />
      break

    case isKbConceptPriceItemFragment(concept):
      content = <PriceItemConceptView concept={concept} />
      break

    case isKbConceptServiceGalleryItemFragment(concept):
      content = <ServiceGalleryItemConceptView concept={concept} />
      break

    case isKbConceptGalleryItemFragment(concept):
      content = <GalleryItemConceptView concept={concept} />
      break

    case isKbConceptGalleryCategoryFragment(concept):
      content = <GalleryCategoryConceptView concept={concept} />
      break

    case isKbConceptServiceCategoryFragment(concept):
      content = <ServiceCategoryConceptView concept={concept} />
      break

    case isKbConceptCategoryFragment(concept):
      content = <CategoryConceptView concept={concept} />
      break

    case isKbConceptProductFragment(concept):
      content = <ProductConceptView concept={concept} />
      break

    case isKbConceptServiceGalleryFragment(concept):
      content = <ServiceGalleryConceptView concept={concept} />
      break

    case isKbConceptFullGalleryItemFragment(concept):
      content = <FullGalleryItemConceptView concept={concept} />
      break

    case isKbConceptPersonalAccountFragment(concept):
      content = <PersonalAccountConceptView concept={concept} />
      break

    case isKbConceptMainWithAccountAndCartFragment(concept):
      content = <MainWithAccountAndCartConceptView concept={concept} />
      break

    default:
      content =
        concept.contentMode === 'hast' ? (
          <Hast tree={concept.hast} />
        ) : (
          <>
            <ConceptGallery key={concept.id} concept={concept} />
            {concept.description && <Markdown>{concept.description}</Markdown>}
            {concept.content && (
              <ConceptContentStyled aria-label="Содержание">
                <Markdown>{concept.content}</Markdown>
              </ConceptContentStyled>
            )}
          </>
        )
  }

  const imported =
    concept.contentMode === 'hast' &&
    CustomKbConceptTypeValues.some((type) => type === concept.type)

  return (
    <ConceptPageStyled
      data-modx-content={imported || undefined}
      {...(imported ? actions : {})}
    >
      <ConceptHeadingStyled>
        <h1>{concept.name}</h1>
      </ConceptHeadingStyled>
      <CustomLayoutSectionStyled>{content}</CustomLayoutSectionStyled>
    </ConceptPageStyled>
  )
}
