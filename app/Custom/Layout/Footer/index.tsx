import { Link } from 'react-router'
import { FooterStyled } from './styles'

export const Footer: React.FC = () => {
  return (
    <FooterStyled>
      <div className="site-container site-footer__content">
        <Link className="site-brand" to="/" aria-label="Home">
          Home
        </Link>
        <p></p>
        <a target="_blank" href="https://fi1osof.ru">
          Архитектура и разработка by 𝕱
        </a>
      </div>
    </FooterStyled>
  )
}
