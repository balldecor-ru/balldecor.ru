import { AddedSkeletonStyled } from './styles'

export const AddedSkeleton: React.FC = () => (
  <AddedSkeletonStyled role="status" aria-label="Загрузка" aria-busy="true">
    <div className="heading" />
    <div className="product" />
    <div className="recommendations" />
    <div className="actions" />
  </AddedSkeletonStyled>
)
