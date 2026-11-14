import { ConceptSearch } from '../../../components/ConceptSearch'
import type * as React from 'react'
import { Link } from 'react-router'
import { useOpenChatWithMessage } from '../../../components/Chat/hooks/useOpenChatWithMessage'
import { ArrowRight } from 'lucide-react'
import { MainPageViewStyled } from './styles'
import hero from './assets/balloon-delivery-hd.jpg'
import heroWebp from './assets/balloon-delivery-hd.webp'
import heroSmall from './assets/balloon-delivery-640.jpg'
import heroSmallWebp from './assets/balloon-delivery-640.webp'
import heroMedium from './assets/balloon-delivery-1280.jpg'
import heroMediumWebp from './assets/balloon-delivery-1280.webp'
import gift from './assets/balloon-gift.jpg'
import giftWebp from './assets/balloon-gift.webp'
import scenes from './assets/catalog-scenes.webp'

const Scene: React.FC<{
  viewBox: string
  label: string
  className?: string
}> = ({ viewBox, label, className }) => (
  <svg
    className={className}
    viewBox={viewBox}
    preserveAspectRatio="xMidYMid slice"
    role="img"
    aria-label={label}
  >
    <image href={scenes} width="935" height="1683" />
  </svg>
)

const categories: ReadonlyArray<{
  title: string
  viewBox: string
  href: string
}> = [
  {
    title: 'Шары с гелием',
    href: '/katalog-sharov-i-figur/lateksnyie-shariki-s-geliem.html',
    viewBox: '40 690 212 224',
  },
  {
    title: 'Шары-цифры',
    href: '/katalog-sharov-i-figur/czifryi-iz-sharov.html',
    viewBox: '266 690 191 224',
  },
  {
    title: 'Шары с конфетти',
    href: '/services/sharyi-s-konfetti.html',
    viewBox: '473 690 207 224',
  },
  {
    title: 'Фигуры из шаров',
    href: '/katalog-sharov-i-figur/figuryi-iz-sharov.html',
    viewBox: '690 690 210 224',
  },
]

export const MainPageView: React.FC = () => {
  const openChat = useOpenChatWithMessage()

  return (
    <MainPageViewStyled>
      <section className="hero" aria-labelledby="hero-heading">
        <picture className="image-formats">
          <source
            type="image/webp"
            srcSet={`${heroSmallWebp} 640w, ${heroMediumWebp} 1280w, ${heroWebp} 1920w`}
            sizes="100vw"
          />
          <img
            className="hero-photo"
            src={hero}
            srcSet={`${heroSmall} 640w, ${heroMedium} 1280w, ${hero} 1920w`}
            sizes="100vw"
            alt="Девушка с воздушными шарами у автомобиля доставки BallDecor"
            fetchPriority="high"
            width={1920}
            height={1080}
          />
        </picture>
        <div className="hero-inner">
          <h1 id="hero-heading" tabIndex={-1}>
            <span>Мы делаем</span> <span>праздники вкусными</span>{' '}
            <span>и сочными!</span>
          </h1>
          <p className="hero-location">Доставка шаров в Москве</p>
          <p className="hero-description">
            Выбирайте в каталоге или расскажите,
            <br className="desktop-break" /> что нужно привезти.
          </p>
          <ConceptSearch />
          <div className="hero-delivery">
            <p>Нужно что-то вне каталога?</p>
            <button
              type="button"
              className="text-action"
              onClick={openChat}
              value="Заказать доставку"
            >
              Заказать доставку <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
      <section
        className="catalog content-width"
        aria-labelledby="catalog-heading"
      >
        <div className="section-heading">
          <h2 id="catalog-heading">Выбирайте в каталоге</h2>
          <Link to="/katalog-sharov-i-figur.html" className="text-action">
            Весь каталог <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map(({ title, viewBox, href }) => (
            <Link key={title} to={href}>
              <figure>
                <Scene viewBox={viewBox} label={title} />
                <figcaption className="text-action">
                  {title}
                  <ArrowRight aria-hidden="true" />
                </figcaption>
              </figure>
            </Link>
          ))}
        </div>
      </section>
      <section
        className="delivery editorial"
        aria-labelledby="delivery-heading"
      >
        <picture className="image-formats">
          <source type="image/webp" srcSet={giftWebp} />
          <img
            className="editorial-image"
            src={gift}
            alt="Подарочная коробка BallDecor с голубыми, белыми и персиковыми шарами"
            width={1280}
            height={722}
            loading="lazy"
          />
        </picture>
        <div className="editorial-copy">
          <h2 id="delivery-heading">
            В каталоге нет того,
            <br className="desktop-break" /> что нужно?
          </h2>
          <p>
            Подарок, покупки или ваша посылка — расскажите, что и куда доставить
            в Москве.
          </p>
          <button
            type="button"
            className="text-action"
            onClick={openChat}
            value="Заказать доставку"
          >
            Заказать доставку <ArrowRight aria-hidden="true" />
          </button>
          <p className="delivery-note">
            Возможность, стоимость и время согласуем при заказе.
          </p>
        </div>
      </section>
      <section
        className="decoration editorial"
        aria-labelledby="decoration-heading"
      >
        <div className="editorial-copy">
          <h2 id="decoration-heading">Оформление шарами</h2>
          <p>Для дня рождения, свадьбы и открытия</p>
          <button
            type="button"
            className="text-action"
            onClick={openChat}
            value="Обсудить оформление"
          >
            Обсудить оформление <ArrowRight aria-hidden="true" />
          </button>
        </div>
        <Scene
          className="editorial-image"
          viewBox="447 1310 488 230"
          label="Праздничное оформление голубыми, белыми, коралловыми и жёлтыми шарами"
        />
      </section>
    </MainPageViewStyled>
  )
}
