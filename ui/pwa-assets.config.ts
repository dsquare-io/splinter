import {
  AllAppleDeviceNames,
  appleSplashScreenSizes,
  defineConfig,
  minimal2023Preset,
  type AppleSplashScreenName,
} from '@vite-pwa/assets-generator/config';

// We only generate one (light) splash variant — no darkResizeOptions configured. The generator's
// asset-writer and its head-link builder disagree on the implied filename in that case (writer
// omits the "-light-" token, head-link builder adds it), which would 404 every splash image at
// runtime. Naming without the `dark` token sidesteps that mismatch since neither path uses it.
const splashScreenName: AppleSplashScreenName = (landscape, size) =>
  `apple-splash-${landscape ? 'landscape' : 'portrait'}-${size.width}x${size.height}.png`;

// Matches the #splash-logo size in index.html's inline splash so the native (pre-JS) and web
// (post-JS) splash logos read as the same size. `padding` scales with the box, so a flat fraction
// would shrink/grow the logo per device; deriving it per-size pins the rendered logo to a fixed
// point size instead, with the rest of the canvas filled by resizeOptions.background.
const LOGO_HEIGHT_PT = 48;

const splashScreenSizes = Array.from(
  new Map(
    AllAppleDeviceNames.map((name) => appleSplashScreenSizes[name]).map((size) => [size.width, size])
  ).values()
).map((size) => ({
  ...size,
  padding: 1 - (LOGO_HEIGHT_PT * size.scaleFactor) / Math.min(size.width, size.height),
}));

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: {
      sizes: splashScreenSizes,
      resizeOptions: { background: '#ffffff', fit: 'contain' },
      name: splashScreenName,
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
        basePath: '/',
        xhtml: false,
      },
    },
  },
  images: ['public/favicon.svg'],
});
