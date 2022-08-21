import { forwardRef } from 'react';

import styles from './Button.module.scss';

type ButtonHTMLType = 'button' | 'submit';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: React.ReactEventHandler;
  name?: string;
  type?: ButtonHTMLType;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

const Button: React.ForwardRefRenderFunction<HTMLButtonElement, ButtonProps> = (
  { children, onClick, type = 'button', disabled, className, ariaLabel, ...props },
  ref
) => {
  return (
    <button
      aria-label={ariaLabel}
      type={type}
      onClick={onClick}
      ref={ref}
      disabled={disabled}
      className={disabled ? styles.disable : styles.active}
      {...props}
    >
      {children}
    </button>
  );
};

export default forwardRef<HTMLButtonElement, ButtonProps>(Button);
