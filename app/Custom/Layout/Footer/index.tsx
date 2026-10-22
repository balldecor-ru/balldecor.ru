import type * as React from 'react'
import { Phone } from 'lucide-react'
import { FooterStyled } from './styles'

export const Footer: React.FC = () => (
  <FooterStyled>
    <div className="footer-inner">
      <span className="brand" aria-label="BallDecor">
        BallDecor
      </span>
      <div className="footer-information">
        <nav aria-label="Навигация в подвале">
          <span>Каталог</span>
          <span>Доставка</span>
          <span>Контакты</span>
        </nav>
        <p>Доставка в посёлке совхоза имени Ленина</p>
      </div>
      <span className="phone">
        <Phone size={18} strokeWidth={1.6} aria-hidden="true" />
        +7 (495) 212-05-69
      </span>
    </div>
  </FooterStyled>
)
