'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext, type SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface PinInputContextValue {
  size: 'sm' | 'md' | 'lg';
  mask: boolean;
  hasError: boolean;
  disabled: boolean;
}

const PinInputContext = React.createContext<PinInputContextValue>({ size: 'md', mask: false, hasError: false, disabled: false });

interface PinInputRootProps {
  size?: 'sm' | 'md' | 'lg';
  mask?: boolean;
  children: React.ReactNode;
  className?: string;
}

function PinInputRoot({ size = 'md', mask = false, children, className }: PinInputRootProps) {
  return (
    <PinInputContext.Provider value={{ size, mask, hasError: false, disabled: false }}>
      <div className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    </PinInputContext.Provider>
  );
}

function PinInputLabel({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <Label
      className={cn(
        'text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted',
        className,
      )}
      {...props}
    >
      {children}
    </Label>
  );
}

interface PinInputGroupProps {
  children: React.ReactNode;
  maxLength: number;
  pattern?: string;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  hasError?: boolean;
}

const sizeConfig = {
  sm: { slot: 'w-8 h-10 text-sm', gap: 'gap-1.5', fontSize: 'text-sm' },
  md: { slot: 'w-10 h-12 text-base', gap: 'gap-2', fontSize: 'text-base' },
  lg: { slot: 'w-12 h-14 text-lg', gap: 'gap-3', fontSize: 'text-lg' },
};

function PinInputGroup({
  children,
  maxLength,
  pattern,
  value,
  onChange,
  onComplete,
  disabled,
  className,
  autoFocus,
  hasError,
}: PinInputGroupProps) {
  const ctx = React.useContext(PinInputContext);
  const cfg = sizeConfig[ctx.size];

  return (
    <PinInputContext.Provider value={{ ...ctx, hasError: hasError ?? false, disabled: disabled ?? false }}>
      <OTPInput
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        disabled={disabled}
        autoFocus={autoFocus}
        containerClassName={cn('flex items-center', cfg.gap, className)}
        pattern={pattern}
        textAlign="center"
      >
        {children}
      </OTPInput>
    </PinInputContext.Provider>
  );
}

function PinInputSlot({ index, className }: { index: number; className?: string }) {
  const ctx = React.useContext(PinInputContext);
  const cfg = sizeConfig[ctx.size];
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot: SlotProps = inputOTPContext.slots[index];

  const isEmpty = slot.char === null;
  const showError = ctx.hasError && isEmpty;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'rounded-xl border font-mono font-bold',
        'transition-all duration-200',
        cfg.slot,
        !ctx.disabled && 'bg-brand-charcoal-base',
        ctx.disabled && 'bg-brand-charcoal-base/50 opacity-60',
        !showError && !slot.isActive && !slot.char && 'border-brand-charcoal-border',
        !showError && !slot.isActive && slot.char && 'border-brand-muted-gold/60',
        !showError && slot.isActive && 'border-brand-muted-gold ring-2 ring-brand-muted-gold/25 shadow-lg shadow-brand-muted-gold/15',
        showError && 'border-brand-error ring-2 ring-brand-error/20 animate-shake',
        ctx.hasError && isEmpty && !slot.isActive && 'border-brand-error/60',
        className,
      )}
    >
      {slot.char !== null ? (
        <span className={cn(cfg.fontSize, 'text-brand-offwhite select-none')}>
          {ctx.mask ? '\u2022' : slot.char}
        </span>
      ) : (
        <span className={cn(cfg.fontSize, 'text-brand-offwhite-muted/15 select-none')}>
          {slot.placeholderChar ?? '\u25CB'}
        </span>
      )}

      {slot.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
          <div className="h-5 w-px bg-brand-muted-gold" />
        </div>
      )}
    </div>
  );
}

function PinInputSeparator({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center text-brand-offwhite-muted/20', className)} aria-hidden>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}

function PinInputDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-xs text-brand-offwhite-muted/50', className)}>
      {children}
    </p>
  );
}

const PinInput = Object.assign(PinInputRoot, {
  Label: PinInputLabel,
  Group: PinInputGroup,
  Slot: PinInputSlot,
  Separator: PinInputSeparator,
  Description: PinInputDescription,
});

export { PinInput };
