import { MainPageCustomStyled } from './styles'
import { MainPageView } from './View'

export const MainPageCustom: React.FC = () => {
  return (
    <MainPageCustomStyled data-home-page>
      <MainPageView />
    </MainPageCustomStyled>
  )
}
