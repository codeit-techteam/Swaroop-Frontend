import {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInDown,
  SlideInRight,
  SlideOutDown,
  SlideOutRight,
} from 'react-native-reanimated';

export const fadeIn = FadeIn.duration(300);
export const fadeOut = FadeOut.duration(200);
export const fadeInDown = FadeInDown.duration(400);
export const slideInRight = SlideInRight.duration(300);
export const slideOutRight = SlideOutRight.duration(200);
export const slideInDown = SlideInDown.duration(300);
export const slideOutDown = SlideOutDown.duration(200);

export const listEntrance = (index: number) =>
  FadeInDown.delay(index * 60)
    .duration(380)
    .springify()
    .damping(18);

export const animationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
  splashFadeIn: 500,
  splashFadeOut: 400,
  splashVisible: 2000,
  heroSlide: 5000,
  pressScale: 120,
} as const;
