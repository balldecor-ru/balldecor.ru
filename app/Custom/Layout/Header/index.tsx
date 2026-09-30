import { Link, NavLink } from 'react-router'
import { HeaderStyled } from './styles'

export const Header: React.FC = () => {
  return (
    <HeaderStyled>
      <div className="site-container site-header__content">
        <Link className="site-brand" to="/" aria-label="HAIH home">
          Logo
          <img src="/logo.png" alt="" width={32} height={32} />
        </Link>
        <nav aria-label="Main">
          <ul className="site-navigation">
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </HeaderStyled>
  )
}
