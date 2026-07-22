import { type PropsWithChildren, useState } from 'react';

type Placement = 'top' | 'bottom' | 'right' | 'left';

const PLACEMENT_CLASSES: Record<Placement, string> = {
  top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
  left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
  right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
};

type Props = Readonly<
  PropsWithChildren & {
    text: string;
    placement?: Placement;
  }
>;

/**
 * Convention: Tooltip wraps the trigger (usually an IconButton), never the reverse.
 * Shows on hover and on keyboard focus of the wrapped trigger; Escape hides it.
 */
export default function Tooltip({ children, text, placement = 'top' }: Props) {
  const [visible, setVisible] = useState(false);

  const show = () => {
    setVisible(true);
  };
  const hide = () => {
    setVisible(false);
  };

  return (
    <span
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      onKeyDownCapture={(e) => {
        if (e.key === 'Escape') hide();
      }}
      className="relative inline-block"
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          className={`bg-text text-surface pointer-events-none absolute z-10 rounded px-2 py-1 text-center text-xs whitespace-nowrap shadow-md ${PLACEMENT_CLASSES[placement]}`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
