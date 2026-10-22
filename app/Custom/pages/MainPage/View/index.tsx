import type * as React from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { MainPageViewStyled } from './styles'
import hero from './assets/hero.webp'
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

const categories: ReadonlyArray<{ title: string; viewBox: string }> = [
  { title: 'Шары с гелием', viewBox: '40 690 212 224' },
  { title: 'Шары-цифры', viewBox: '266 690 191 224' },
  { title: 'Шары с конфетти', viewBox: '473 690 207 224' },
  { title: 'Фигуры из шаров', viewBox: '690 690 210 224' },
]

export const MainPageView: React.FC = () => (
  <MainPageViewStyled>
    <section className="hero" aria-labelledby="hero-heading">
      <img
        className="hero-photo"
        src={hero}
        alt="Доставщик с покупками у белого пикапа с подарками и воздушными шарами"
        fetchPriority="high"
        width={1586}
        height={992}
      />
      <div className="hero-inner">
        <h1 id="hero-heading" tabIndex={-1}>
          Шары, подарки
          <br />и всё, что
          <br />
          пожелаете
        </h1>
        <p className="hero-location">Доставка в посёлке совхоза имени Ленина</p>
        <p className="hero-description">
          Выбирайте в каталоге или расскажите,
          <br className="desktop-break" /> что нужно привезти.
        </p>
        <div className="catalog-search">
          <label htmlFor="catalog-query">Поиск по каталогу</label>
          <div className="search-field">
            <Search aria-hidden="true" size={27} strokeWidth={1.5} />
            <input
              id="catalog-query"
              type="search"
              placeholder="Например, шары на день рождения"
              readOnly
            />
            <button type="button" aria-disabled="true">
              Найти
            </button>
          </div>
          <div className="quick-categories">
            <span>Шары-цифры</span>
            <span>С гелием</span>
            <span>С конфетти</span>
          </div>
        </div>
        <div className="hero-delivery">
          <p>Нужно что-то вне каталога?</p>
          <span className="text-action">
            Заказать доставку <ArrowRight aria-hidden="true" />
          </span>
        </div>
      </div>
    </section>
    <section
      className="catalog content-width"
      aria-labelledby="catalog-heading"
    >
      <div className="section-heading">
        <h2 id="catalog-heading">Выбирайте в каталоге</h2>
        <span className="text-action">
          Весь каталог <ArrowRight aria-hidden="true" />
        </span>
      </div>
      <div className="category-grid">
        {categories.map(({ title, viewBox }) => (
          <figure key={title}>
            <Scene viewBox={viewBox} label={title} />
            <figcaption className="text-action">
              {title}
              <ArrowRight aria-hidden="true" />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
    <section className="delivery editorial" aria-labelledby="delivery-heading">
      <Scene
        className="editorial-image"
        viewBox="0 997 475 283"
        label="Крафтовый пакет с покупками, посылка и подарок с коралловой лентой"
      />
      <div className="editorial-copy">
        <h2 id="delivery-heading">
          В каталоге нет того,
          <br className="desktop-break" /> что нужно?
        </h2>
        <p>
          Подарок, покупки или ваша посылка — расскажите, что и куда доставить в
          посёлке совхоза имени Ленина.
        </p>
        <span className="text-action">
          Заказать доставку <ArrowRight aria-hidden="true" />
        </span>
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
        <span className="text-action">
          Обсудить оформление <ArrowRight aria-hidden="true" />
        </span>
      </div>
      <Scene
        className="editorial-image"
        viewBox="447 1310 488 230"
        label="Праздничное оформление голубыми, белыми, коралловыми и жёлтыми шарами"
      />
    </section>
  </MainPageViewStyled>
)
