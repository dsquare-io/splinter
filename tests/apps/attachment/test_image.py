import io

from django.test import SimpleTestCase
from PIL import Image

from splinter.apps.attachment.image import _apply_exif_orientation, generate_thumbnail, resize_for_storage


def _make_image_bytes(width=100, height=100, fmt='JPEG', color='red') -> bytes:
    img = Image.new('RGB', (width, height), color)
    buf = io.BytesIO()
    img.save(buf, fmt)
    return buf.getvalue()


def _make_image_with_exif_orientation(orientation: int) -> bytes:
    img = Image.new('RGB', (200, 100), 'blue')
    exif = Image.Exif()
    exif[0x0112] = orientation
    buf = io.BytesIO()
    img.save(buf, 'JPEG', exif=exif.tobytes())
    return buf.getvalue()


class ResizeForStorageTests(SimpleTestCase):
    def test_returns_webp_bytes(self):
        raw = _make_image_bytes(100, 100)
        img, data = resize_for_storage(raw)
        output = Image.open(io.BytesIO(data))
        self.assertEqual(output.format, 'WEBP')

    def test_returns_pil_image(self):
        raw = _make_image_bytes(100, 100)
        img, data = resize_for_storage(raw)
        self.assertIsInstance(img, Image.Image)

    def test_small_image_not_enlarged(self):
        raw = _make_image_bytes(100, 100)
        img, _ = resize_for_storage(raw)
        self.assertEqual(img.size, (100, 100))

    def test_wide_image_capped_at_2048(self):
        raw = _make_image_bytes(4096, 1024)
        img, _ = resize_for_storage(raw)
        self.assertEqual(img.size[0], 2048)
        self.assertEqual(img.size[1], 512)

    def test_tall_image_capped_at_2048(self):
        raw = _make_image_bytes(1024, 4096)
        img, _ = resize_for_storage(raw)
        self.assertEqual(img.size[0], 512)
        self.assertEqual(img.size[1], 2048)

    def test_square_at_limit_unchanged(self):
        raw = _make_image_bytes(2048, 2048)
        img, _ = resize_for_storage(raw)
        self.assertEqual(img.size, (2048, 2048))

    def test_converts_to_rgb(self):
        img = Image.new('RGBA', (100, 100), (255, 0, 0, 128))
        buf = io.BytesIO()
        img.save(buf, 'PNG')
        _, data = resize_for_storage(buf.getvalue())
        result = Image.open(io.BytesIO(data))
        self.assertEqual(result.mode, 'RGB')


class GenerateThumbnailTests(SimpleTestCase):
    def _img(self, w, h, color='red'):
        return Image.new('RGB', (w, h), color)

    def test_returns_200x200(self):
        data = generate_thumbnail(self._img(400, 300))
        result = Image.open(io.BytesIO(data))
        self.assertEqual(result.size, (200, 200))

    def test_returns_webp(self):
        data = generate_thumbnail(self._img(100, 100))
        result = Image.open(io.BytesIO(data))
        self.assertEqual(result.format, 'WEBP')

    def test_square_input(self):
        data = generate_thumbnail(self._img(300, 300))
        result = Image.open(io.BytesIO(data))
        self.assertEqual(result.size, (200, 200))

    def test_wide_image_cropped(self):
        data = generate_thumbnail(self._img(600, 200))
        result = Image.open(io.BytesIO(data))
        self.assertEqual(result.size, (200, 200))

    def test_tall_image_cropped(self):
        data = generate_thumbnail(self._img(200, 600))
        result = Image.open(io.BytesIO(data))
        self.assertEqual(result.size, (200, 200))


class ApplyExifOrientationTests(SimpleTestCase):
    def test_no_exif_returns_image(self):
        img = Image.new('RGB', (100, 50), 'red')
        result = _apply_exif_orientation(img)
        self.assertEqual(result.size, (100, 50))

    def test_orientation_6_rotates_270(self):
        # Orientation 6 = rotate 270° CW → portrait becomes landscape
        raw = _make_image_with_exif_orientation(6)
        img = Image.open(io.BytesIO(raw))
        result = _apply_exif_orientation(img)
        # Original 200w×100h rotated 270° → 100w×200h
        self.assertEqual(result.size, (100, 200))

    def test_orientation_8_rotates_90(self):
        raw = _make_image_with_exif_orientation(8)
        img = Image.open(io.BytesIO(raw))
        result = _apply_exif_orientation(img)
        self.assertEqual(result.size, (100, 200))

    def test_orientation_3_rotates_180(self):
        raw = _make_image_with_exif_orientation(3)
        img = Image.open(io.BytesIO(raw))
        result = _apply_exif_orientation(img)
        # 180° keeps same dimensions
        self.assertEqual(result.size, (200, 100))
