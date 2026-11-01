import { AccountActions } from '../../components/AccountActions'
import type * as React from 'react'
import { Link } from 'react-router'
import { Phone } from 'lucide-react'
import { StorefrontHeaderStyled } from './storefrontStyles'

export const StorefrontHeader: React.FC = () => (
  <StorefrontHeaderStyled>
    <div className="storefront-header-inner">
      <Link to="/" className="brand" aria-label="BallDecor">
        BallDecor
      </Link>
      <nav aria-label="Основная навигация">
        <Link to="/katalog-sharov-i-figur.html">Каталог</Link>
        <Link to="/dostavka-sharov.html">Доставка</Link>
        <Link to="/oformlenie-vosdyshnymi-sharami.html">Оформление шарами</Link>
        <Link to="/contacts.html">Контакты</Link>
      </nav>
      <a className="phone" href="tel:+74952120569">
        <Phone size={19} strokeWidth={1.6} aria-hidden="true" />
        +7 (495) 212-05-69
      </a>
      <AccountActions />
    </div>
  </StorefrontHeaderStyled>
)
