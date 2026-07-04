import { memo, type ReactNode } from 'react';

import { Text, type TextProps } from 'react-native';

import { cn } from '@/utils/cn';

type TypographyVariant =
  | 'splashTitle'
  | 'splashTagline'
  | 'splashStatus'
  | 'heading'
  | 'subheading'
  | 'caption'
  | 'body'
  | 'button'
  | 'skip'
  | 'logo'
  | 'footer'
  | 'illustrationLabel';

type TypographyProps = TextProps & {
  children: ReactNode;
  variant?: TypographyVariant;
  className?: string;
};

const variantClasses: Record<TypographyVariant, string> = {
  splashTitle: 'font-bold text-[28px] tracking-[2.4px] text-brand-title uppercase',
  splashTagline: 'font-sans text-[11px] tracking-[1.6px] text-brand-tagline uppercase text-center',
  splashStatus: 'font-sans text-[11px] tracking-[1.4px] text-brand-muted uppercase text-center',
  heading: 'font-bold text-[22px] leading-[28px] text-brand-primary text-center',
  subheading: 'font-sans text-[14px] leading-[22px] text-brand-body text-center',
  caption: 'font-medium text-[12px] tracking-[1.2px] text-brand-primary uppercase text-center',
  body: 'font-sans text-base text-brand-body',
  button: 'font-bold text-[15px] tracking-[0.6px] text-brand-white',
  skip: 'font-sans text-[14px] text-brand-skip',
  logo: 'font-bold text-[16px] text-brand-primary',
  footer: 'font-sans text-[10px] tracking-[1.2px] text-brand-footer uppercase',
  illustrationLabel:
    'font-semibold text-[13px] tracking-[1.6px] text-brand-navy uppercase text-center',
};

export const Typography = memo(function Typography({
  children,
  variant = 'body',
  className,
  ...props
}: TypographyProps) {
  return (
    <Text className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Text>
  );
});
