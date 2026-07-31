import { ThemeUIStyleObject } from 'theme-ui';

const body: ThemeUIStyleObject = {
  display: 'inline-block',
  fontSize: 'font-size-md',
  fontWeight: 'font-weight-semi-bold',
  lineHeight: 'body',
  px: 'spacing-xs',
  borderRadius: 'radius-sm',
  borderWidth: 'border-width-sm',
  borderStyle: 'solid',
};

export const badgeVariants: Record<string, ThemeUIStyleObject> = {
  neutral: {
    ...body,
    bg: 'bgPanel',
    color: 'textSubtle',
    borderColor: 'borderPanel',
  },
  info: {
    ...body,
    bg: 'accent50',
    color: 'accent700',
    borderColor: 'accent200',
  },
  warning: {
    ...body,
    bg: 'brand100',
    color: 'neutral900',
    borderColor: 'brand500',
  },
  positive: {
    ...body,
    bg: 'bgPositive',
    color: 'textPositive',
    borderColor: 'positive500',
  },
  negative: {
    ...body,
    bg: 'bgNegative',
    color: 'textNegative',
    borderColor: 'negative500',
  },
};
