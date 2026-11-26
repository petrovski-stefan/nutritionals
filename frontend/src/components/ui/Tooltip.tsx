import { type PropsWithChildren, useLayoutEffect, useRef, useState } from 'react';

type Placement = 'top' | 'bottom' | 'right' | 'left';

type Position = { top: number; left: number };

// Distance between trigger and tooltip, and the minimum margin to the viewport edge
const GAP = 6;
const EDGE = 8;

const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const PLACE: Record<Placement, (trigger: DOMRect, width: number, height: number) => Position> = {
  top: (t, w, h) => ({ top: t.top - h - GAP, left: t.left + t.width / 2 - w / 2 }),
  bottom: (t, w) => ({ top: t.bottom + GAP, left: t.left + t.width / 2 - w / 2 }),
  left: (t, w, h) => ({ top: t.top + t.height / 2 - h / 2, left: t.left - w - GAP }),
  right: (t, _w, h) => ({ top: t.top + t.height / 2 - h / 2, left: t.right + GAP }),
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Preferred side first, the opposite side if it doesn't fit, then kept inside the viewport
const positionTooltip = (trigger: HTMLElement, tooltip: HTMLElement, placement: Placement) => {
  const triggerRect = trigger.getBoundingClientRect();
  const { width, height } = tooltip.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  const fits = ({ top, left }: Position) =>
    top >= EDGE &&
    left >= EDGE &&
    top + height <= viewportHeight - EDGE &&
    left + width <= viewportWidth - EDGE;

  const preferred = PLACE[placement](triggerRect, width, height);
  const flipped = PLACE[OPPOSITE[placement]](triggerRect, width, height);
  const position = !fits(preferred) && fits(flipped) ? flipped : preferred;

  tooltip.style.top = `${String(clamp(position.top, EDGE, viewportHeight - height - EDGE))}px`;
  tooltip.style.left = `${String(clamp(position.left, EDGE, viewportWidth - width - EDGE))}px`;
};

type Props = Readonly<
  PropsWithChildren & {
    text: string;
    placement?: Placement;
  }
>;

/**
 * Convention: Tooltip wraps the trigger (usually an IconButton), never the reverse.
 * Shows on hover and on keyboard focus of the wrapped trigger; Escape, scroll and resize hide it.
 *
 * The tooltip is a native popover, so the browser draws it in the top layer: no `overflow`
 * container can clip it or grow a scrollbar for it, while it stays in place in the React tree.
 */
export default function Tooltip({ children, text, placement = 'top' }: Props) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    setVisible(true);
  };
  const hide = () => {
    setVisible(false);
  };

  // Layout effect: open and position the popover before the browser paints it
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!visible || !trigger || !tooltip) return;

    tooltip.showPopover();
    positionTooltip(trigger, tooltip, placement);

    // The position is fixed to the viewport, so it would drift away from a scrolled trigger
    const handleViewportChange = () => {
      setVisible(false);
    };

    window.addEventListener('scroll', handleViewportChange, { capture: true, passive: true });
    window.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('scroll', handleViewportChange, { capture: true });
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [visible, placement]);

  return (
    <span
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      onKeyDownCapture={(e) => {
        if (e.key === 'Escape') hide();
      }}
      className="inline-block"
    >
      {children}

      {visible && (
        <span
          ref={tooltipRef}
          role="tooltip"
          popover="manual"
          className="bg-text text-surface pointer-events-none fixed inset-auto m-0 rounded border-0 px-2 py-1 text-center text-xs whitespace-nowrap shadow-md transition-opacity duration-150 ease-out motion-reduce:transition-none starting:opacity-0"
        >
          {text}
        </span>
      )}
    </span>
  );
}
