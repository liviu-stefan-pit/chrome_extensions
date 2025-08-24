import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SIZES = [16, 32, 48, 128]

def radial_gradient_circle(draw: ImageDraw.ImageDraw, size: int, inner, outer):
    for r in range(size//2, 0, -1):
        t = r / (size/2)
        color = (
            int(inner[0] + (outer[0]-inner[0]) * (1-t)),
            int(inner[1] + (outer[1]-inner[1]) * (1-t)),
            int(inner[2] + (outer[2]-inner[2]) * (1-t)),
            255
        )
        draw.ellipse([
            (size/2 - r, size/2 - r),
            (size/2 + r, size/2 + r)
        ], fill=color)

def create_icon(size: int, out_dir: Path):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    draw = ImageDraw.Draw(img)

    # Forest gradient background
    radial_gradient_circle(draw, size, (24,60,46,255), (30,143,85,255))

    # Leaf glyph
    leaf_color = (215,239,225,255)
    drew_text = False
    for font_name in ["seguiemj.ttf", "seguisym.ttf", "Segoe UI Emoji.ttf", "Apple Color Emoji.ttf"]:
        try:
            font_size = int(size * 0.55)
            font = ImageFont.truetype(font_name, font_size)
            leaf_char = "🌿"
            tw, th = draw.textbbox((0,0), leaf_char, font=font)[2:]
            draw.text(((size - tw) / 2, (size - th) / 2 - 2), leaf_char, font=font, fill=leaf_color)
            drew_text = True
            break
        except Exception:
            continue
    if not drew_text:
        draw.polygon([
            (size*0.55, size*0.2), (size*0.75, size*0.45), (size*0.55, size*0.8),
            (size*0.45, size*0.8), (size*0.35, size*0.45), (size*0.45, size*0.2)
        ], fill=leaf_color)
        draw.line([(size*0.5, size*0.25), (size*0.5, size*0.75)], fill=(30,143,85,255), width=max(1, size//16))

    out_path = out_dir / f"icon-{size}.png"
    img.save(out_path)
    print(f"Generated {out_path}")

def main():
    root = Path(__file__).resolve().parent.parent  # tabsy/
    images_dir = root / "images"
    images_dir.mkdir(exist_ok=True)
    for s in SIZES:
        create_icon(s, images_dir)

if __name__ == "__main__":
    main()
