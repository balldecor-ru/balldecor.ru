import { styled } from '@linaria/react'
import { theme } from '../../../theme'

export const MainPageViewStyled = styled.div`
  --page-gutter: 20px;
  color: ${theme.colors.foreground};
  h1,
  h2 {
    font-weight: 300;
    letter-spacing: -0.045em;
    line-height: 1.08;
  }
  h2 {
    font-size: clamp(32px, 4.4vw, 68px);
  }
  .content-width {
    width: calc(100% - var(--page-gutter) * 2);
    max-width: 1386px;
    margin-inline: auto;
  }
  .text-action {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    color: ${theme.colors.link};
    font-weight: 600;
    transition: color ${theme.transitions.fast};
    font-size: 18px;
  }
  button.text-action {
    padding: 0;
    border: 0;
    background: transparent;
    text-align: left;
  }
  .text-action svg {
    width: 23px;
    flex-shrink: 0;
    stroke-width: 1.3;
  }
  a.text-action:is(:hover, :focus-visible),
  button.text-action:is(:hover, :focus-visible),
  .category-grid > a:is(:hover, :focus-visible) .text-action {
    color: ${theme.colors.linkHover};
  }
  .text-action svg {
    transition: transform ${theme.transitions.fast};
  }
  a.text-action:is(:hover, :focus-visible) svg,
  button.text-action:is(:hover, :focus-visible) svg,
  .category-grid > a:is(:hover, :focus-visible) .text-action svg {
    transform: translateX(4px);
  }
  .hero {
    position: relative;
    isolation: isolate;
    padding: 132px 0 355px;
    background: #edf7ff;
    overflow: hidden;
  }
  .hero-photo {
    display: block;
    width: 100%;
    height: 330px;
    object-fit: cover;
    object-position: right;
    position: absolute;
    bottom: 0;
    z-index: -1;
  }
  .hero-inner {
    padding: 0 var(--page-gutter);
    position: relative;
  }
  h1 {
    font-size: clamp(43px, 7vw, 64px);
  }
  .hero-location {
    margin-top: 22px;
    font-size: 20px;
    line-height: 1.3;
    max-width: 660px;
  }
  .hero-description {
    margin-top: 14px;
    color: ${theme.colors.text.secondary};
    font-size: 17px;
    line-height: 1.45;
  }
  .catalog-search {
    margin-top: 30px;
    max-width: 680px;
  }
  .catalog-search label {
    display: block;
    margin-bottom: 9px;
    color: ${theme.colors.primary};
    font-size: 15px;
  }
  .search-field {
    height: 60px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 4px 12px;
    border: 1px solid #a5b3c4;
    border-radius: 7px;
    background: #ffffffed;
    color: ${theme.colors.primary};
  }
  .search-field > svg {
    flex-shrink: 0;
    width: 23px;
  }
  .search-field input {
    border: 0;
    outline: 0;
    min-width: 0;
    width: 100%;
    background: transparent;
    color: ${theme.colors.foreground};
    font-size: 12px;
  }
  .search-field input::placeholder {
    color: #818b9e;
    opacity: 1;
  }
  .search-field button {
    align-self: stretch;
    padding: 0 18px;
    border: 0;
    border-radius: 5px;
    background: ${theme.colors.primary};
    color: white;
    font-size: 15px;
    cursor: default;
  }
  .quick-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 26px;
    margin-top: 14px;
    font-size: 14px;
    color: ${theme.colors.primary};
  }
  .quick-categories a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: ${theme.colors.link};
    font-weight: 600;
    border-radius: ${theme.radii.sm};
    transition: color ${theme.transitions.fast};
  }
  .quick-categories a:is(:hover, :focus-visible) {
    color: ${theme.colors.linkHover};
  }
  .quick-categories a svg {
    width: 1em;
    height: 1em;
    flex-shrink: 0;
    stroke-width: 1.5;
    transition: transform ${theme.transitions.fast};
  }
  .quick-categories a:is(:hover, :focus-visible) svg {
    transform: translateX(3px);
  }
  .hero-delivery {
    margin-top: 30px;
  }
  .hero-delivery p {
    font-size: 15px;
    margin-bottom: 5px;
    color: ${theme.colors.text.secondary};
  }
  .catalog {
    padding-block: 44px 50px;
  }
  .section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
  }
  .category-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px 16px;
  }
  figure {
    margin: 0;
    min-width: 0;
  }
  figure > svg {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1.12;
  }
  figcaption.text-action {
    font-size: 14px;
    gap: 8px;
    margin-top: 12px;
  }
  figcaption svg {
    width: 18px !important;
  }
  .editorial {
    display: grid;
    max-width: 1586px;
    margin-inline: auto;
    gap: 26px;
  }
  .editorial-image {
    display: block;
    width: 100%;
    height: auto;
  }
  .editorial-copy {
    padding: 0 var(--page-gutter);
    align-self: center;
  }
  .editorial-copy > p {
    font-size: 19px;
    line-height: 1.4;
    color: ${theme.colors.text.secondary};
    margin-top: 20px;
  }
  .editorial-copy .text-action {
    margin-top: 26px;
  }
  .editorial-copy .delivery-note {
    font-size: 14px;
    margin-top: 25px;
  }
  .decoration {
    margin-top: 48px;
  }
  .decoration .editorial-image {
    margin-top: 4px;
  }
  .desktop-break {
    display: none;
  }
  @media (min-width: ${theme.breakpoints.md}px) {
    --page-gutter: 6.3%;
    .desktop-break {
      display: initial;
    }
    .hero {
      padding: clamp(132px, 9vw, 160px) 0 10.5%;
      min-height: 62.55vw;
    }
    .hero-photo {
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      margin: 0;
    }
    .hero-inner {
      width: 100%;
      max-width: 1586px;
      margin-inline: auto;
    }
    h1 {
      font-size: clamp(52px, 5.6vw, 89px);
    }
    .hero-location {
      margin-top: 20px;
      font-size: clamp(19px, 2vw, 31px);
      max-width: 52%;
    }
    .hero-description {
      font-size: clamp(16px, 1.5vw, 24px);
      margin-top: 14px;
    }
    .catalog-search {
      margin-top: clamp(25px, 3vw, 48px);
      width: 49%;
    }
    .catalog-search label {
      font-size: clamp(14px, 1.25vw, 20px);
    }
    .search-field {
      height: clamp(56px, 4.5vw, 72px);
    }
    .search-field input {
      font-size: clamp(12px, 1.15vw, 18px);
    }
    .search-field button {
      min-width: 24%;
      font-size: clamp(15px, 1.25vw, 20px);
    }
    .quick-categories {
      font-size: clamp(14px, 1.25vw, 20px);
      gap: 48px;
    }
    .hero-delivery {
      margin-top: clamp(28px, 3.4vw, 54px);
    }
    .hero-delivery p {
      font-size: clamp(14px, 1.25vw, 20px);
    }
    .text-action {
      font-size: clamp(18px, 1.7vw, 27px);
      gap: 20px;
    }
    .catalog {
      padding-block: 64px 88px;
    }
    .section-heading {
      margin-bottom: 32px;
    }
    .section-heading > .text-action {
      font-size: clamp(18px, 1.5vw, 24px);
    }
    .category-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 36px;
    }
    figcaption.text-action {
      font-size: clamp(15px, 1.5vw, 24px);
      gap: 16px;
      margin-top: 16px;
    }
    .editorial {
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }
    .editorial-copy {
      padding: 24px 12.6% 24px 6.5%;
    }
    .editorial-copy h2 {
      font-size: clamp(32px, 4.2vw, 64px);
    }
    .editorial-copy > p {
      font-size: clamp(18px, 1.9vw, 29px);
    }
    .editorial-copy .delivery-note {
      font-size: clamp(14px, 1.4vw, 21px);
    }
    .editorial-image {
      height: 100%;
      object-fit: cover;
    }
    .decoration {
      margin-top: 48px;
      grid-template-columns: 48% 52%;
    }
    .decoration .editorial-copy {
      padding-left: 13.1%;
      padding-right: 4%;
    }
    .decoration h2 {
      font-size: clamp(32px, 4vw, 62px);
    }
    .decoration .editorial-image {
      margin-top: 0;
    }
  }
  @media (min-width: 1586px) {
    .hero {
      min-height: 992px;
      padding-bottom: 166px;
    }
  }
`
