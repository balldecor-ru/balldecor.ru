import wordmark from '../assets/wordmark.svg'
import { AccountActions } from '../../components/AccountActions'
import type * as React from 'react'
import { Link } from 'react-router'
import { Phone } from 'lucide-react'
import { StorefrontHeaderStyled } from './storefrontStyles'

export const StorefrontHeader: React.FC = () => (
  <StorefrontHeaderStyled>
    <div className="storefront-header-inner">
      <Link to="/" className="brand" aria-label="BallDecor">
        <img src={wordmark} alt="" width={473.5} height={110} />
      </Link>
      <nav aria-label="Основная навигация">
        <Link to="/katalog-sharov-i-figur.html">Каталог</Link>
        <Link to="/services.html">Услуги</Link>
        <Link to="/gallery.html">Галерея</Link>
        <Link to="/contacts.html">Контакты</Link>
      </nav>
      <a
        className="phone"
        href="tel:+74952120569"
        aria-label="Позвонить: +7 (495) 212-05-69"
      >
        <Phone size={19} strokeWidth={1.6} aria-hidden="true" />
        <span className="phone-number">+7 (495) 212-05-69</span>
      </a>
      <AccountActions />
    </div>
  </StorefrontHeaderStyled>
)
