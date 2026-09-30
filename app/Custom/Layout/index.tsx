import { Header } from './Header'
import { Footer } from './Footer'
import { LayoutCustomMainStyled, LayoutCustomStyled } from './styles'

export const LayoutCustom: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <LayoutCustomStyled>
      <Header />
      <LayoutCustomMainStyled tabIndex={-1}>{children}</LayoutCustomMainStyled>
      <Footer />
    </LayoutCustomStyled>
  )
}
