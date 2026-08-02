import { ThemeUIStyleObject } from 'theme-ui';

const body: ThemeUIStyleObject = {
  bg: 'black',
  color: 'white',
  fontWeight: 'font-weight-semi-bold',
  width: '420px',
  minHeight: 68,
  px: 'spacing-lg',
  py: 'spacing-md',
  borderWidth: 'border-width-lg',
  borderType: 'solid',
  borderColor: 'black',
  position: 'relative',
  borderRadius: 'radius-md',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  boxShadow: (theme: any) => theme.shadows['shadow-md'],
};

export const alertVariants: Record<string, ThemeUIStyleObject> = {
  success: {
    ...body,
    color: 'positive500',
  },
  error: {
    ...body,
    color: 'negative500',
  },
  inlineSuccess: {
    display: 'inline-block',
    bg: 'positive100',
    color: 'black',
    padding: 0,
    borderLeftWidth: 'border-width-lg',
    borderLeftStyle: 'solid',
    borderLeftColor: 'positive500',
    borderRadius: 0,
    fontWeight: 'font-weight-normal',
  },
  inlineError: {
    display: 'inline-block',
    bg: 'negative100',
    color: 'black',
    padding: 0,
    borderLeftWidth: 'border-width-lg',
    borderLeftStyle: 'solid',
    borderLeftColor: 'negative500',
    borderRadius: 0,
    fontWeight: 'font-weight-normal',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    bg: 'brand100',
    color: 'neutral900',
    fontWeight: 'font-weight-normal',
    borderWidth: 'border-width-sm',
    borderStyle: 'solid',
    borderColor: 'brand500',
    borderRadius: 'radius-md',
    px: 'spacing-lg',
    py: 'spacing-md',
  },
};
