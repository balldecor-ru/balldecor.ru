import type * as React from 'react'
import { Link } from 'react-router'
import { Phone } from 'lucide-react'
import { FooterStyled } from './styles'

export const Footer: React.FC = () => (
  <FooterStyled>
    <div className="footer-inner">
      <Link to="/" className="brand" aria-label="BallDecor">
        BallDecor
      </Link>
      <div className="footer-information">
        <nav aria-label="Навигация в подвале">
          <Link to="/katalog-sharov-i-figur.html">Каталог</Link>
          <Link to="/dostavka-sharov.html">Доставка</Link>
          <Link to="/contacts.html">Контакты</Link>
        </nav>
        <p>Доставка в посёлке совхоза имени Ленина</p>
      </div>
      <a className="phone" href="tel:+74952120569">
        <Phone size={18} strokeWidth={1.6} aria-hidden="true" />
        +7 (495) 212-05-69
      </a>
    </div>
  </FooterStyled>
)
