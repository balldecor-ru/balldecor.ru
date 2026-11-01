import { styled } from '@linaria/react'
import { theme } from '../../theme'

export const ConceptPageStyled = styled.article`
  min-width: 0;
  &[data-modx-content] {
    --section-gap: clamp(32px, 6vw, 80px);
    width: calc(100% - clamp(40px, 10vw, 144px));
    max-width: 1386px;
    margin: auto;
    padding-block: var(--section-gap);
    color: ${theme.colors.foreground};
    font-family: ${theme.font};
    overflow-wrap: anywhere;
  }
  &[data-modx-content] > section,
  &[data-modx-content] > header {
    max-width: none;
    padding: 0;
  }
  &[data-modx-content]:has(> section h1) > header {
    display: none;
  }
  #main-content
    > &[data-modx-content]:has(> header > h1)
    > section
    h1:first-child {
    display: block;
  }
  &[data-modx-content] {
    h1,
    h2,
    h3 {
      margin: 0 0 0.6em;
      font-weight: 300;
      line-height: 1.1;
      letter-spacing: -0.04em;
      text-wrap: balance;
    }
    h1 {
      font-size: clamp(36px, 5vw, 64px);
    }
    h2 {
      font-size: clamp(26px, 3.2vw, 46px);
    }
    h3 {
      font-size: clamp(21px, 2vw, 30px);
    }
    :is(p, ul, ol) {
      line-height: 1.65;
      margin-block: 0 1em;
    }
    ul,
    ol {
      padding-inline-start: 1.4em;
    }
    img {
      max-width: 100%;
      height: auto;
      vertical-align: middle;
    }
    figure {
      margin: 0;
    }
    address {
      font-style: normal;
    }
    hr {
      border: 0;
      border-top: 1px solid ${theme.colors.divider};
      margin: 1.5rem 0;
    }
    .text > :is(p, ul, ol) {
      max-width: 76ch;
    }
    .text > :is(h2, h3):not(:first-child) {
      margin-top: 1.5em;
    }
    a {
      color: ${theme.colors.link};
    }
    a:hover {
      color: ${theme.colors.linkHover};
    }
    .text p a {
      text-decoration: underline !important;
      text-underline-offset: 0.18em;
    }
    :is(.btn, .bd-btn, button[type='submit'], input[type='submit']) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: ${theme.colors.primary};
      color: white;
      border: 0;
      border-radius: ${theme.radii.md};
      padding: 11px 20px;
      cursor: pointer;
      font: inherit;
      font-weight: 600;
      line-height: 1.4;
    }
    :is(.btn, .bd-btn, button[type='submit'], input[type='submit']):hover {
      color: white;
      background: ${theme.colors.linkHover};
    }
    :is(
      input:not([type]),
      input[type='text'],
      input[type='number'],
      input[type='tel'],
      input[type='email'],
      input[type='password'],
      textarea,
      select
    ) {
      width: 100%;
      min-width: 0;
      max-width: 100%;
      padding: 10px 12px;
      border: 1px solid ${theme.colors.borderHover};
      border-radius: ${theme.radii.md};
      color: inherit;
      background: white;
    }
    textarea {
      min-height: 7rem;
      resize: vertical;
    }
    input.product-input {
      width: 5em;
    }
    .form-group {
      margin-bottom: 12px;
    }
    .alert,
    .quick-form,
    .pre_breadcrumbs:not(:empty) {
      padding: clamp(16px, 3vw, 32px);
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.gray[50]};
    }
    .panel-heading {
      font-size: 1.4em;
      margin-bottom: 1em;
    }
    .row:has(> [class*='col-']) {
      display: grid;
      gap: clamp(14px, 2vw, 30px);
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
      margin-block: 1.5rem;
    }
    [class*='col-'] {
      min-width: 0;
    }
    .page-image {
      display: block;
      width: 100%;
      max-height: min(62vh, 600px);
      object-fit: contain;
      background: ${theme.colors.gray[50]};
      border-radius: ${theme.radii.lg};
      margin-bottom: var(--section-gap);
    }
    .real-gallery:not(:has(.carousel-viewport)) {
      display: grid;
      gap: 20px;
      justify-items: center;
    }
    .real-gallery img {
      max-height: 75vh;
      object-fit: contain;
      border-radius: ${theme.radii.lg};
    }
    .gal-item-ttl,
    .product-title {
      font-weight: 600;
      margin-block: 0.65em;
    }
    .product-card {
      display: grid;
      align-content: start;
      gap: 12px;
    }
    .product-card img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: contain;
    }
    .price {
      font-size: 1.2em;
      font-weight: 600;
    }
    .collapse:not(.in),
    .modal,
    .success-popup,
    .mfp-hide,
    #ajaxBusy,
    .blueimp-gallery {
      display: none;
    }
    @media (max-width: 559px) {
      .text img[align] {
        float: none;
        display: block;
        margin: 1em auto;
      }
      .text :is(.pull-left, .pull-right) {
        float: none;
      }
    }
    table {
      display: block;
      overflow-x: auto;
      max-width: 100%;
      border-collapse: collapse;
    }
    :is(td, th) {
      padding: 8px;
      border-bottom: 1px solid ${theme.colors.divider};
    }
  }
`
export const ConceptHeadingStyled = styled.header`
  padding: 24px 24px 0;
  max-width: 1328px;
  margin: auto;
  h1 {
    font-size: clamp(26px, 3.5vw, 42px);
    line-height: 1.18;
    letter-spacing: -0.025em;
    overflow-wrap: anywhere;
  }
  p {
    margin-bottom: 12px;
    color: #64748b;
    font-size: 13px;
    letter-spacing: 0.04em;
  }
  @media (min-width: 800px) {
    padding: 32px 40px 0;
  }
`
export const ConceptContentStyled = styled.section`
  margin-top: 24px;
  padding: 20px;
  line-height: 1.75;
  overflow-wrap: anywhere;
  img {
    max-width: 100%;
    height: auto;
  }
  @media (min-width: 560px) {
    margin-top: 36px;
    padding: 28px 32px;
  }
`
