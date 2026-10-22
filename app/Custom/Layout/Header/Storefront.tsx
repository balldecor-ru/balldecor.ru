import type * as React from 'react'
import { Phone } from 'lucide-react'
import { StorefrontHeaderStyled } from './storefrontStyles'

export const StorefrontHeader: React.FC = () => (
  <StorefrontHeaderStyled>
    <div className="storefront-header-inner">
      <span className="brand" aria-label="BallDecor">
        BallDecor
      </span>
      <nav aria-label="Основная навигация">
        <span>Каталог</span>
        <span>Доставка</span>
        <span>Оформление шарами</span>
        <span>Контакты</span>
      </nav>
      <span className="phone">
        <Phone size={19} strokeWidth={1.6} aria-hidden="true" />
        +7 (495) 212-05-69
      </span>
    </div>
  </StorefrontHeaderStyled>
)
