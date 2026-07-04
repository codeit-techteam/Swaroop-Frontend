import { memo, type ReactNode } from 'react';

import { Text, type TextProps } from 'react-native';

import { cn } from '@/utils/cn';

type TypographyVariant =
  | 'splashTitle'
  | 'splashTagline'
  | 'splashStatus'
  | 'heading'
  | 'headingLeft'
  | 'subheading'
  | 'subheadingLeft'
  | 'caption'
  | 'body'
  | 'button'
  | 'buttonSecondary'
  | 'skip'
  | 'logo'
  | 'logoUpper'
  | 'footer'
  | 'illustrationLabel'
  | 'fieldLabel'
  | 'input'
  | 'link'
  | 'badge'
  | 'success'
  | 'error'
  | 'sectionTitle'
  | 'roleTitle'
  | 'roleDescription'
  | 'legal';

type TypographyProps = TextProps & {
  children: ReactNode;
  variant?: TypographyVariant;
  className?: string;
};

const variantClasses: Record<TypographyVariant, string> = {
  splashTitle: 'font-bold text-[28px] tracking-[2.4px] text-brand-title uppercase',
  splashTagline: 'font-sans text-[11px] tracking-[1.6px] text-brand-tagline uppercase text-center',
  splashStatus: 'font-sans text-[11px] tracking-[1.4px] text-brand-muted uppercase text-center',
  heading: 'font-bold text-[22px] leading-[28px] text-brand-heading text-center',
  headingLeft: 'font-bold text-[22px] leading-[28px] text-brand-heading',
  subheading: 'font-sans text-[14px] leading-[22px] text-brand-body text-center',
  subheadingLeft: 'font-sans text-[14px] leading-[22px] text-brand-body',
  caption: 'font-medium text-[12px] tracking-[1.2px] text-brand-primary uppercase text-center',
  body: 'font-sans text-base text-brand-body',
  button: 'font-bold text-[15px] tracking-[0.6px] text-brand-white',
  buttonSecondary: 'font-semibold text-[15px] text-brand-white',
  skip: 'font-sans text-[14px] text-brand-skip',
  logo: 'font-bold text-[16px] text-brand-primary',
  logoUpper: 'font-bold text-[15px] tracking-[1.5px] text-brand-primary uppercase',
  footer: 'font-sans text-[10px] tracking-[1.2px] text-brand-footer uppercase',
  illustrationLabel:
    'font-semibold text-[13px] tracking-[1.6px] text-brand-navy uppercase text-center',
  fieldLabel: 'font-medium text-[11px] tracking-[1px] text-brand-label uppercase',
  input: 'font-sans text-[15px] text-brand-heading',
  link: 'font-medium text-[13px] text-brand-link',
  badge: 'font-semibold text-[10px] tracking-[0.8px] text-brand-badge-text uppercase',
  success: 'font-medium text-[12px] text-brand-success',
  error: 'font-sans text-[12px] text-brand-error',
  sectionTitle: 'font-bold text-[24px] leading-[30px] text-brand-heading text-center',
  roleTitle: 'font-bold text-[16px] text-brand-heading',
  roleDescription: 'font-sans text-[13px] text-brand-body',
  legal: 'font-sans text-[11px] leading-[16px] text-brand-footer text-center',
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
