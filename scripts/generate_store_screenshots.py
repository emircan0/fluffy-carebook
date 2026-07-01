from __future__ import annotations

from pathlib import Path
from typing import Callable, Iterable

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "store-assets" / "screenshots"
ICON = ROOT / "assets" / "icon.png"

CREAM = "#FDFBF7"
SURFACE = "#FFFFFF"
INK = "#252820"
MUTED = "#8B8A80"
SAGE = "#95AD96"
SAGE_DARK = "#6F876F"
SAGE_SOFT = "#EAF0EA"
BORDER = "#E7DED1"
WARN = "#C9786F"
GOLD = "#D8C49A"

FONT_REG = "/System/Library/Fonts/SFNS.ttf"
FONT_BOLD = "/System/Library/Fonts/SFNS.ttf"
FONT_ROUNDED = "/System/Library/Fonts/SFNSRounded.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_ROUNDED if bold else FONT_REG
    return ImageFont.truetype(path, size=size)


def rr(draw: ImageDraw.ImageDraw, box, r: int, fill, outline=None, width: int = 1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def text(draw: ImageDraw.ImageDraw, xy, value: str, size: int, fill=INK, bold=False, anchor=None, align="left"):
    draw.text(xy, value, font=font(size, bold), fill=fill, anchor=anchor, align=align)


def multiline(draw: ImageDraw.ImageDraw, xy, value: str, size: int, fill=INK, bold=False, spacing=10, align="left"):
    draw.multiline_text(xy, value, font=font(size, bold), fill=fill, spacing=spacing, align=align)


def shadow_layer(size, box, radius, blur=36, offset=(0, 16), opacity=32):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x1, y1, x2, y2 = box
    ox, oy = offset
    d.rounded_rectangle((x1 + ox, y1 + oy, x2 + ox, y2 + oy), radius=radius, fill=(80, 68, 50, opacity))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def load_icon(size: int) -> Image.Image:
    img = Image.open(ICON).convert("RGBA")
    img.thumbnail((size, size), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(img, ((size - img.width) // 2, (size - img.height) // 2))
    return canvas


def paste_icon(base: Image.Image, xy, size: int):
    icon = load_icon(size)
    base.alpha_composite(icon, xy)


def phone_frame(base: Image.Image, xy, scale: float, screen: Callable[[Image.Image, ImageDraw.ImageDraw, int, int], None]):
    w = int(470 * scale)
    h = int(1018 * scale)
    x, y = xy
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.alpha_composite(shadow_layer(base.size, (x, y, x + w, y + h), int(70 * scale), blur=int(28 * scale), offset=(0, int(18 * scale)), opacity=38))
    d = ImageDraw.Draw(layer)
    rr(d, (x, y, x + w, y + h), int(74 * scale), "#10110F", None)
    rr(d, (x + int(16 * scale), y + int(16 * scale), x + w - int(16 * scale), y + h - int(16 * scale)), int(60 * scale), CREAM, None)
    notch_w = int(136 * scale)
    notch_h = int(38 * scale)
    rr(d, (x + w // 2 - notch_w // 2, y + int(34 * scale), x + w // 2 + notch_w // 2, y + int(34 * scale) + notch_h), int(20 * scale), "#050505")
    base.alpha_composite(layer)

    sx = x + int(38 * scale)
    sy = y + int(92 * scale)
    sw = w - int(76 * scale)
    sh = h - int(146 * scale)
    screen(base, ImageDraw.Draw(base), sx, sy)
    d = ImageDraw.Draw(base)
    rr(d, (x + int(170 * scale), y + h - int(36 * scale), x + w - int(170 * scale), y + h - int(30 * scale)), int(4 * scale), "#1F211C")


def small_pill(draw, x, y, label, active=False):
    rr(draw, (x, y, x + 150, y + 58), 29, SAGE_SOFT if active else "#F8F4ED", SAGE if active else BORDER, 2)
    text(draw, (x + 75, y + 29), label, 20, SAGE_DARK if active else MUTED, True, anchor="mm")


def screen_dashboard(base, d, x, y):
    text(d, (x, y), "Bugün", 54, INK, True)
    text(d, (x, y + 62), "Emircan · Köpüş", 20, MUTED, True)
    small_pill(d, x, y + 118, "🐶  Köpüş", True)
    rr(d, (x, y + 220, x + 394, y + 430), 42, SURFACE, BORDER, 2)
    paste_icon(base, (x + 34, y + 260), 82)
    text(d, (x + 34, y + 350), "Köpüş", 46, INK, True)
    text(d, (x + 34, y + 400), "Sahip", 19, MUTED, True)
    rr(d, (x + 290, y + 266, x + 360, y + 382), 34, "#F2EDE4")
    rr(d, (x + 322, y + 292, x + 334, y + 348), 8, "#E4D8C8")
    text(d, (x + 326, y + 390), "4", 23, INK, True, anchor="mm")
    text(d, (x + 326, y + 416), "görev", 17, MUTED, True, anchor="mm")
    rr(d, (x, y + 480, x + 394, y + 548), 34, "#F8F4ED", BORDER, 2)
    rr(d, (x + 8, y + 488, x + 130, y + 540), 28, SAGE)
    text(d, (x + 69, y + 515), "Bakım", 19, "#FFFFFF", True, anchor="mm")
    text(d, (x + 197, y + 515), "Kayıt", 19, MUTED, True, anchor="mm")
    text(d, (x + 326, y + 515), "Akış", 19, MUTED, True, anchor="mm")
    rr(d, (x, y + 610, x + 394, y + 820), 42, SURFACE)
    text(d, (x + 28, y + 648), "BUGÜN", 17, SAGE_DARK, True)
    text(d, (x + 28, y + 680), "Bakım", 34, INK, True)
    for i, (icon, label, state) in enumerate([("🍽", "Mama", "Bugün yapıldı"), ("💧", "Su", "Bugün 2 kez"), ("🚶", "Yürüyüş", "Bekliyor")]):
        yy = y + 735 + i * 64
        rr(d, (x + 28, yy, x + 366, yy + 52), 26, "#FAF8F4", BORDER, 1)
        text(d, (x + 54, yy + 27), icon, 24, anchor="mm")
        text(d, (x + 86, yy + 15), label, 18, INK, True)
        text(d, (x + 86, yy + 35), state, 14, MUTED)


def screen_quicklog(base, d, x, y):
    text(d, (x, y), "Hızlı bakım", 42, INK, True)
    text(d, (x, y + 52), "Tek dokunuşla kaydet", 20, MUTED, True)
    labels = [("🍽", "Mama", "2 kez"), ("💧", "Su", "3 kez"), ("🧪", "İlaç", "Bekliyor"), ("🧼", "Kum", "Yapıldı"), ("🚶", "Yürüyüş", "18:00")]
    for i, item in enumerate(labels):
        col = i % 2
        row = i // 2
        xx = x + col * 204
        yy = y + 130 + row * 178
        w = 184 if i < 4 else 394
        rr(d, (xx, yy, xx + w, yy + 146), 34, SURFACE, BORDER, 2)
        rr(d, (xx + 22, yy + 22, xx + 78, yy + 78), 22, SAGE_SOFT)
        text(d, (xx + 50, yy + 50), item[0], 26, anchor="mm")
        text(d, (xx + 22, yy + 92), item[1], 22, INK, True)
        text(d, (xx + 22, yy + 120), item[2], 16, SAGE_DARK if item[2] != "Bekliyor" else MUTED, True)
    rr(d, (x, y + 705, x + 394, y + 820), 36, SAGE)
    text(d, (x + 36, y + 734), "Mama kaydedildi", 28, "#FFFFFF", True)
    text(d, (x + 36, y + 772), "Evdeki herkes anında görür.", 18, "#EEF5EE")


def screen_reminders(base, d, x, y):
    text(d, (x, y), "Hatırlatıcılar", 40, INK, True)
    text(d, (x, y + 52), "Aşı, ilaç ve veteriner takibi", 20, MUTED, True)
    rr(d, (x + 306, y + 2, x + 380, y + 76), 37, SAGE)
    text(d, (x + 343, y + 38), "+", 42, "#FFFFFF", True, anchor="mm")
    items = [("Aşı", "30 Temmuz", "Yıllık karma aşı", SAGE), ("İlaç", "Bugün 21:00", "Akşam dozu", WARN), ("Veteriner", "5 Ağustos", "Kontrol randevusu", GOLD)]
    for i, (title, date, sub, color) in enumerate(items):
        yy = y + 160 + i * 166
        rr(d, (x, yy, x + 394, yy + 132), 34, SURFACE, BORDER, 2)
        rr(d, (x + 26, yy + 28, x + 86, yy + 88), 24, color + "33")
        text(d, (x + 56, yy + 58), "●", 24, color, anchor="mm")
        text(d, (x + 110, yy + 28), title, 24, INK, True)
        text(d, (x + 110, yy + 62), sub, 17, MUTED)
        text(d, (x + 110, yy + 92), date, 18, SAGE_DARK, True)
    rr(d, (x, y + 700, x + 394, y + 820), 36, "#F8F4ED", BORDER, 2)
    text(d, (x + 28, y + 732), "Bildirim tercihleri", 25, INK, True)
    text(d, (x + 28, y + 768), "Sadece istediğin hatırlatmalar.", 18, MUTED)


def screen_family(base, d, x, y):
    text(d, (x, y), "Birlikte takip", 42, INK, True)
    text(d, (x, y + 52), "Owner, editor ve viewer rolleri", 20, MUTED, True)
    rr(d, (x, y + 140, x + 394, y + 360), 42, SURFACE, BORDER, 2)
    text(d, (x + 28, y + 180), "Bakımı birlikte mi takip edeceksiniz?", 25, INK, True)
    text(d, (x + 28, y + 230), "Aileni veya bakıcını aynı pet profiline davet et.", 18, MUTED)
    rr(d, (x + 28, y + 292, x + 212, y + 338), 23, SAGE)
    text(d, (x + 120, y + 315), "Davet et", 18, "#FFFFFF", True, anchor="mm")
    for i, (name, role) in enumerate([("Emircan", "Sahip"), ("Ayşe", "Editör"), ("Bakıcı", "İzleyici")]):
        yy = y + 430 + i * 112
        rr(d, (x, yy, x + 394, yy + 88), 28, SURFACE, BORDER, 2)
        rr(d, (x + 22, yy + 18, x + 74, yy + 70), 26, SAGE_SOFT)
        text(d, (x + 48, yy + 44), name[0], 22, SAGE_DARK, True, anchor="mm")
        text(d, (x + 94, yy + 18), name, 22, INK, True)
        text(d, (x + 94, yy + 48), role, 16, MUTED, True)
        text(d, (x + 340, yy + 44), "✓", 24, SAGE_DARK, True, anchor="mm")


def screen_onboarding(base, d, x, y):
    paste_icon(base, (x + 125, y + 30), 140)
    text(d, (x + 197, y + 210), "YuvioPet", 42, INK, True, anchor="mm")
    multiline(d, (x, y + 292), "Evcil dostunun\nbakımını birlikte\ntakip et.", 44, INK, True, spacing=8, align="center")
    rr(d, (x + 28, y + 520, x + 366, y + 620), 34, SURFACE, BORDER, 2)
    text(d, (x + 60, y + 550), "🐾", 28)
    text(d, (x + 108, y + 540), "İlk petini ekle", 23, INK, True)
    text(d, (x + 108, y + 572), "Mama, su, kum ve yürüyüş görevleri hazır.", 16, MUTED)
    rr(d, (x + 28, y + 648, x + 366, y + 748), 34, SAGE)
    text(d, (x + 197, y + 698), "Başlayalım", 22, "#FFFFFF", True, anchor="mm")


SCREENS: list[tuple[str, str, str, Callable]] = [
    ("01-dashboard", "Günün bakımı\ntek ekranda", "Mama, su, ilaç ve yürüyüşleri sade bir akışta takip et.", screen_dashboard),
    ("02-quick-log", "Tek dokunuşla\nbakım kaydı", "Sık aksiyonları bekletmeden kaydet, herkes aynı anda görsün.", screen_quicklog),
    ("03-reminders", "Hatırlatmalar\nkarışmasın", "Aşı, ilaç ve veteriner tarihleri güvenle yanında.", screen_reminders),
    ("04-family", "Bakımı ailece\nyönetin", "Sahip, editör ve izleyici rolleriyle kontrollü paylaşım.", screen_family),
    ("05-onboarding", "İlk kurulum\nçok kolay", "Petini ekle, temel görevleri seç ve hemen kullanmaya başla.", screen_onboarding),
]


def make_canvas(size: tuple[int, int], title: str, subtitle: str, screen_fn: Callable, device: str) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", size, CREAM)
    d = ImageDraw.Draw(img)
    # soft background accents
    rr(d, (-180, 120, 440, 740), 280, "#F6F0E5")
    rr(d, (w - 360, h - 780, w + 180, h - 240), 260, "#EEF3ED")

    margin = int(w * 0.085)
    if device.startswith("iphone"):
        title_size = int(w * 0.066)
        subtitle_size = int(w * 0.025)
        title_y = int(h * 0.07)
        subtitle_y = int(h * 0.205)
        title_spacing = int(w * 0.012)
    else:
        title_size = int(w * 0.045)
        subtitle_size = int(w * 0.019)
        title_y = int(h * 0.075)
        subtitle_y = int(h * 0.21)
        title_spacing = int(w * 0.008)

    multiline(d, (margin, title_y), title, title_size, INK, True, spacing=title_spacing)
    multiline(d, (margin, subtitle_y), subtitle, subtitle_size, MUTED, False, spacing=8)

    if device.startswith("iphone"):
        phone_frame(img, (int(w * 0.34), int(h * 0.27)), 1.34, screen_fn)
        rr(d, (margin, h - 250, margin + 250, h - 176), 37, SAGE_SOFT, SAGE, 2)
        text(d, (margin + 125, h - 213), "YuvioPet", 26, SAGE_DARK, True, anchor="mm")
    else:
        # iPad-oriented app surface
        x = int(w * 0.27)
        y = int(h * 0.30)
        card_w = int(w * 0.62)
        card_h = int(h * 0.58)
        img.alpha_composite(shadow_layer(size, (x, y, x + card_w, y + card_h), 56, blur=32, offset=(0, 18), opacity=28))
        rr(d, (x, y, x + card_w, y + card_h), 56, SURFACE, BORDER, 2)
        phone_frame(img, (x + 86, y + 82), 1.08, screen_fn)
        rr(d, (x + int(card_w * 0.56), y + 130, x + card_w - 84, y + 430), 34, "#F8F4ED", BORDER, 2)
        text(d, (x + int(card_w * 0.60), y + 180), "Evdeki herkes", 34, INK, True)
        text(d, (x + int(card_w * 0.60), y + 236), "aynı pet bakım akışını\nanlık olarak görür.", 24, MUTED)
        rr(d, (x + int(card_w * 0.60), y + 330, x + card_w - 130, y + 380), 25, SAGE)
        text(d, (x + int(card_w * 0.755), y + 355), "Senkron", 22, "#FFFFFF", True, anchor="mm")

    return img.convert("RGB")


def export_set(device: str, size: tuple[int, int]):
    out_dir = OUT / device
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, title, subtitle, screen_fn in SCREENS:
        img = make_canvas(size, title, subtitle, screen_fn, device)
        path = out_dir / f"{name}-{size[0]}x{size[1]}.png"
        img.save(path, "PNG", optimize=True)
        print(path)


def main():
    export_set("iphone-6.9", (1320, 2868))
    export_set("ipad-13", (2064, 2752))


if __name__ == "__main__":
    main()
