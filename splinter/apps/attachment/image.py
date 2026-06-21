import io
import logging

from PIL import Image

logger = logging.getLogger(__name__)


def _apply_exif_orientation(img: Image.Image) -> Image.Image:
    try:
        exif = img.getexif()
        orientation = exif.get(0x0112, 1)
    except Exception:
        logger.warning('Failed to read EXIF orientation', exc_info=True)
        return img

    ops = {
        2: Image.FLIP_LEFT_RIGHT,
        3: Image.ROTATE_180,
        4: Image.FLIP_TOP_BOTTOM,
        5: Image.TRANSPOSE,
        6: Image.ROTATE_270,
        7: Image.TRANSVERSE,
        8: Image.ROTATE_90,
    }
    if orientation in ops:
        img = img.transpose(ops[orientation])

    return img


def resize_for_storage(raw: bytes) -> tuple[Image.Image, bytes]:
    img = Image.open(io.BytesIO(raw))
    img = _apply_exif_orientation(img).convert('RGB')
    w, h = img.size
    if max(w, h) > 2048:
        if w >= h:
            img = img.resize((2048, int(h * 2048 / w)), Image.LANCZOS)
        else:
            img = img.resize((int(w * 2048 / h), 2048), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format='WEBP', quality=85)
    return img, buf.getvalue()


def generate_thumbnail(img: Image.Image) -> bytes:
    w, h = img.size
    if w > h:
        left = (w - h) // 2
        img = img.crop((left, 0, left + h, h))
    elif h > w:
        top = (h - w) // 2
        img = img.crop((0, top, w, top + w))
    img = img.resize((200, 200), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format='WEBP', quality=85)
    return buf.getvalue()
