import type React from 'react'
import { Button } from 'app/Custom/components/Button'
import { Link } from 'react-router'
import {
  KbConceptVisibility,
  type KbConceptNoNestingFragment,
} from 'app/gql/generated'
import { CustomKbConceptType } from 'app/Custom/interfaces/conceptType'
import { ConceptRowStyled } from './styles'
import { getResizedImagePath } from 'app/Custom/helpers/getResizedImagePath'

const dateFormat: Intl.DateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Moscow',
})

export const ConceptRow: React.FC<{
  concept: KbConceptNoNestingFragment
  loading: boolean
  error?: string
  onChange: React.MouseEventHandler<HTMLButtonElement>
  onBlur: React.EventHandler<React.SyntheticEvent<HTMLInputElement>>
}> = ({ concept, loading, error, onChange, onBlur }) => {
  const published =
    concept.visibility === KbConceptVisibility.PUBLIC ||
    concept.visibility === KbConceptVisibility.HIDDEN
  const hidden = concept.visibility === KbConceptVisibility.HIDDEN
  const typeLabel =
    Object.values(CustomKbConceptType).find(
      (type) => type.value === concept.type,
    )?.description ??
    concept.type ??
    '—'
  return (
    <ConceptRowStyled role="row">
      <div role="cell">
        {concept.image && (
          <img
            src={getResizedImagePath({
              path: concept.image,
              size: 'thumb',
            })}
          />
        )}
      </div>
      <div role="cell">
        <Link to={concept.uri}>{concept.name || concept.id}</Link>
      </div>
      <div role="cell" className="uri">
        <Link to={concept.uri}>{concept.uri}</Link>
      </div>
      <div role="cell" title={concept.type ?? undefined}>
        {typeLabel}
      </div>
      <div role="cell">
        <time dateTime={concept.createdAt}>
          {dateFormat.format(new Date(concept.createdAt))}
        </time>
      </div>
      <div role="cell">
        <time dateTime={concept.updatedAt}>
          {dateFormat.format(new Date(concept.updatedAt))}
        </time>
      </div>
      <div role="cell">
        <Button
          size="small"
          variant={published ? 'success' : 'danger'}
          disabled={loading}
          aria-label={`Опубликован: ${concept.name || concept.id}`}
          aria-pressed={published}
          name="published"
          data-id={concept.id}
          onClick={onChange}
        >
          {published ? 'Да' : 'Нет'}
        </Button>
      </div>
      <div role="cell">
        <Button
          size="small"
          variant={hidden ? 'danger' : 'success'}
          disabled={loading || !published}
          title={
            !published
              ? 'Скрытость доступна для опубликованного концепта'
              : undefined
          }
          aria-label={`Скрыт: ${concept.name || concept.id}`}
          aria-pressed={hidden}
          name="hidden"
          data-id={concept.id}
          onClick={onChange}
        >
          {hidden ? 'Да' : 'Нет'}
        </Button>
      </div>
      <div role="cell">
        <Button
          size="small"
          variant={
            concept.available === true
              ? 'success'
              : concept.available === false
                ? 'danger'
                : 'secondary'
          }
          disabled={loading}
          aria-label={`В наличии: ${concept.name || concept.id}`}
          aria-pressed={concept.available === true}
          name="available"
          data-id={concept.id}
          onClick={onChange}
        >
          {concept.available === null || concept.available === undefined
            ? '—'
            : concept.available
              ? 'Да'
              : 'Нет'}
        </Button>
      </div>
      <div role="cell" className="price">
        <input
          key={concept.price ?? ''}
          name="price"
          data-id={concept.id}
          type="text"
          inputMode="decimal"
          defaultValue={concept.price ?? ''}
          aria-label={`Цена: ${concept.name || concept.id}`}
          disabled={loading}
          onBlur={onBlur}
        />
        {error && <span role="alert">{error}</span>}
      </div>
      <div role="cell" className="quality">
        <div className="quality-range">
          <Button
            size="small"
            variant="secondary"
            name="qualityDown"
            data-id={concept.id}
            disabled={loading || (concept.quality ?? 0.5) <= 0}
            aria-label={`Понизить качество: ${concept.name || concept.id}`}
            onClick={onChange}
          >
            ←
          </Button>
          <input
            key={concept.quality ?? 'unset'}
            type="range"
            name="quality"
            data-id={concept.id}
            min={0}
            max={1}
            step={0.01}
            defaultValue={concept.quality ?? 0.5}
            disabled={loading}
            aria-label={`Качество: ${concept.name || concept.id}`}
            onChange={onBlur}
            onPointerDown={onBlur}
            onPointerUp={onBlur}
            onPointerCancel={onBlur}
            onKeyUp={onBlur}
            onBlur={onBlur}
          />
          <Button
            size="small"
            variant="secondary"
            name="qualityUp"
            data-id={concept.id}
            disabled={loading || (concept.quality ?? 0.5) >= 1}
            aria-label={`Повысить качество: ${concept.name || concept.id}`}
            onClick={onChange}
          >
            →
          </Button>
        </div>
      </div>
    </ConceptRowStyled>
  )
}
