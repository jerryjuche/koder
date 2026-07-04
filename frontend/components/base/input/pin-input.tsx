'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext, type SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// ─── Context ───────────────────────────────────────────────────────────────

interface PinInputContextValue {
  size: 'sm' | 'md' | 'lg';
}

const PinInputContext = React.createContext<PinInputContextValue>({ size: 'md' });

// ─── Root ──────────────────────────────────────────────────────────────────

interface PinInputRootProps {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

function PinInputRoot({ size = 'md', children, className }: PinInputRootProps) {
  return (
    <PinInputContext.Provider value={{ size }}>
      <div className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    </PinInputContext.Provider>
  );
}

// ─── Label ─────────────────────────────────────────────────────────────────

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

// ─── Group ─────────────────────────────────────────────────────────────────

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
}

const sizeConfig = {
  sm: {
    slot: 'w-8 h-10 text-base',
    gap: 'gap-1.5',
    fontSize: 'text-base',
  },
  md: {
    slot: 'w-10 h-12 text-lg',
    gap: 'gap-2',
    fontSize: 'text-lg',
  },
  lg: {
    slot: 'w-12 h-14 text-xl',
    gap: 'gap-3',
    fontSize: 'text-xl',
  },
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
}: PinInputGroupProps) {
  const ctx = React.useContext(PinInputContext);
  const cfg = sizeConfig[ctx.size];

  return (
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
  );
}

// ─── Slot ──────────────────────────────────────────────────────────────────

interface PinInputSlotProps {
  index: number;
  className?: string;
}

function PinInputSlot({ index, className }: PinInputSlotProps) {
  const ctx = React.useContext(PinInputContext);
  const cfg = sizeConfig[ctx.size];
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot: SlotProps = inputOTPContext.slots[index];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'rounded-xl border bg-brand-charcoal-base',
        'text-brand-offwhite font-mono font-bold',
        'transition-all duration-150',
        'border-brand-charcoal-border',
        cfg.slot,
        slot.isActive && 'border-brand-muted-gold ring-1 ring-brand-muted-gold/30 shadow-lg shadow-brand-muted-gold/10',
        slot.char && 'border-brand-muted-gold/50',
        className,
      )}
    >
      {slot.char !== null ? (
        <span className={cfg.fontSize}>{slot.char}</span>
      ) : (
        <span className={cn('text-brand-offwhite-muted/20', cfg.fontSize)}>
          {slot.placeholderChar ?? '○'}
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

// ─── Separator ─────────────────────────────────────────────────────────────

interface PinInputSeparatorProps {
  className?: string;
}

function PinInputSeparator({ className }: PinInputSeparatorProps) {
  return (
    <div className={cn('text-brand-offwhite-muted/30', className)} aria-hidden>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}

// ─── Description ───────────────────────────────────────────────────────────

interface PinInputDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

function PinInputDescription({ children, className }: PinInputDescriptionProps) {
  return (
    <p className={cn('text-xs text-brand-offwhite-muted/60', className)}>
      {children}
    </p>
  );
}

// ─── Compose ───────────────────────────────────────────────────────────────

const PinInput = Object.assign(PinInputRoot, {
  Label: PinInputLabel,
  Group: PinInputGroup,
  Slot: PinInputSlot,
  Separator: PinInputSeparator,
  Description: PinInputDescription,
});

export { PinInput };
export type {
  PinInputRootProps,
  PinInputGroupProps,
  PinInputSlotProps,
  PinInputSeparatorProps,
  PinInputDescriptionProps,
};
