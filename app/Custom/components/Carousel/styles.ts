import { css } from '@linaria/core'
import { styled } from '@linaria/react'

export const carouselClassStyles = css`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto;
  width: min(100%, calc(80svh * var(--photo-ratio, 2)));
  margin-inline: auto;
  min-width: 0;
  .carousel-viewport {
    grid-row: 1;
    aspect-ratio: var(--photo-ratio, auto);
    overflow: hidden;
  }
  .carousel-track {
    display: flex;
    touch-action: pan-y pinch-zoom;
  }
  .carousel-track > figure,
  .carousel-track > .item {
    flex: 0 0 100%;
    min-width: 0;
    margin: 0;
  }
  .carousel-track img {
    display: block;
    width: 100%;
    height: auto;
    cursor: zoom-in;
  }
  .carousel-controls {
    grid-row: 2;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 12px;
  }
  .carousel-controls button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid #d7d5da;
    border-radius: 50%;
    background: transparent;
    color: #35313c;
    cursor: pointer;
  }
  .carousel-controls button:hover:enabled {
    background: #f4f3f5;
  }
  .carousel-controls button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -4px;
  }
  .carousel-controls button:disabled {
    color: #bcb9c1;
    border-color: #e7e5e9;
    cursor: default;
  }
  .carousel-controls button::before {
    content: '';
    width: 7px;
    height: 7px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    transform: rotate(45deg);
  }
  .carousel-controls button:first-child::before {
    transform: rotate(-135deg);
  }
  .carousel-controls span {
    color: #706b76;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  @media (min-width: 768px) {
    max-width: calc(620px * var(--photo-ratio, 2));
  }
`

export const CarouselDialogStyled = styled.dialog`
  position: fixed;
  padding: 0;
  border: 0;
  border-radius: 12px;
  &::backdrop {
    background: #000c;
  }
  width: min(94vw, 1400px);
  color: white;
  background: #17151b;
  .viewport {
    overflow: hidden;
  }
  .track {
    display: flex;
    touch-action: pan-y pinch-zoom;
  }
  img {
    flex: 0 0 100%;
    min-width: 0;
    width: 100%;
    height: 78dvh;
    object-fit: contain;
  }
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  form button {
    position: absolute;
    top: 8px;
    right: 8px;
  }
  button:disabled {
    opacity: 0.4;
  }
  button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: #17151bcc;
    color: white;
    font: 28px/1 sans-serif;
    cursor: pointer;
  }
`
