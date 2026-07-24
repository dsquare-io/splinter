import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: {
      padding: 0.44,
      resizeOptions: { background: '#ffffff', fit: 'contain' },
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
        basePath: '/',
        xhtml: false,
      },
      sizes: [
        // iPhone SE / iPod Touch
        { width: 640, height: 1136, scaleFactor: 2 },
        // iPhone 8/7/6
        { width: 750, height: 1334, scaleFactor: 2 },
        // iPhone 8+/7+/6+
        { width: 1242, height: 2208, scaleFactor: 3 },
        // iPhone X/Xs/11 Pro/12 mini/13 mini
        { width: 1125, height: 2436, scaleFactor: 3 },
        // iPhone Xs Max/11 Pro Max
        { width: 1242, height: 2688, scaleFactor: 3 },
        // iPhone XR/11
        { width: 828, height: 1792, scaleFactor: 2 },
        // iPhone 12/12 Pro/13/13 Pro/14
        { width: 1170, height: 2532, scaleFactor: 3 },
        // iPhone 12 Pro Max/13 Pro Max/14 Plus
        { width: 1284, height: 2778, scaleFactor: 3 },
        // iPhone 14 Pro / 15 Pro
        { width: 1179, height: 2556, scaleFactor: 3 },
        // iPhone 14 Pro Max / 15 Plus / 15 Pro Max
        { width: 1290, height: 2796, scaleFactor: 3 },
        // iPad Mini/Air/9.7" Pro
        { width: 1536, height: 2048, scaleFactor: 2 },
        // iPad Pro 10.5"
        { width: 1668, height: 2224, scaleFactor: 2 },
        // iPad Pro 11"
        { width: 1668, height: 2388, scaleFactor: 2 },
        // iPad Pro 12.9"
        { width: 2048, height: 2732, scaleFactor: 2 },
      ],
    },
  },
  images: ['public/favicon.svg'],
});
