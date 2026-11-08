import type * as React from 'react'
import type { UserNoNestingFragment } from 'app/gql/generated'
import { getResizedImagePath } from 'app/Custom/helpers/getResizedImagePath'
import { UserAvatarStyled } from './styles'

type UserAvatarProps = {
  user?: Pick<UserNoNestingFragment, 'image' | 'fullname' | 'username'>
  size?: number
  src?: string | null
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 32,
  src,
}) => {
  const name = user?.fullname || user?.username || 'Я'
  const image =
    src !== undefined
      ? src
      : user?.image
        ? getResizedImagePath({ path: user.image, size: 'avatar' })
        : null

  return (
    <UserAvatarStyled
      style={{ width: size, height: size, fontSize: Math.max(14, size / 2.75) }}
      aria-hidden="true"
    >
      {image ? <img src={image} alt="" /> : name.slice(0, 1).toUpperCase()}
    </UserAvatarStyled>
  )
}
