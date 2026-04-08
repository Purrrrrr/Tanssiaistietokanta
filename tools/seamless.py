#!/usr/bin/env python3

import argparse
from PIL import Image, ImageDraw, ImageFilter
import os
import sys

def trim_vertical_percentage(img, trim_top=0.0, trim_bottom=0.0):
    if trim_top == 0 and trim_bottom == 0:
        return img

    w, h = img.size

    top_px = int(h * trim_top)
    bottom_px = int(h * trim_bottom)

    # Clamp to valid range
    top_px = max(0, min(top_px, h - 1))
    bottom_px = max(0, min(bottom_px, h - 1))

    # Prevent invalid crop
    if top_px + bottom_px >= h:
        raise ValueError("Trim percentages remove entire image height.")

    return img.crop((0, top_px, w, h - bottom_px))

def trim_horizontal_percentage(img, trim_left=0.0, trim_right=0.0):
    if trim_left == 0 and trim_right == 0:
        return img

    w, h = img.size

    left_px = int(w * trim_left)
    right_px = int(w * trim_right)

    # Clamp to valid range
    left_px = max(0, min(left_px, w - 1))
    right_px = max(0, min(right_px, w - 1))

    # Prevent invalid crop
    if left_px + right_px >= w:
        raise ValueError("Trim percentages remove entire image width.")

    return img.crop((left_px, 0, w - right_px, h))

def create_gradient_mask(width, height, horizontal=True, reverse=False, blur=0):
    mask = Image.new("L", (width, height))
    draw = ImageDraw.Draw(mask)

    if horizontal:
        for x in range(width):
            alpha = int(255 * (x / width))
            if reverse:
                alpha = 255 - alpha
            draw.line([(x, 0), (x, height)], fill=alpha)
    else:
        for y in range(height):
            alpha = int(255 * (y / height))
            if reverse:
                alpha = 255 - alpha
            draw.line([(0, y), (width, y)], fill=alpha)

    if blur > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(blur))

    return mask


def seamless_horizontal(img, blend_width, blur):
    w, h = img.size

    left = img.crop((0, 0, blend_width, h))
    right = img.crop((w - blend_width, 0, w, h))

    left_mask = create_gradient_mask(blend_width, h, True, True, blur)
    right_mask = create_gradient_mask(blend_width, h, True, False, blur)

    result = img.convert("RGBA")

    result.paste(right, (0, 0), right_mask)
    result.paste(left, (w - blend_width, 0), left_mask)

    crop_l = blend_width // 2
    crop_r = w - (blend_width // 2)

    return result.crop((crop_l, 0, crop_r, h))


def seamless_vertical(img, blend_height, blur):
    w, h = img.size

    top = img.crop((0, 0, w, blend_height))
    bottom = img.crop((0, h - blend_height, w, h))

    top_mask = create_gradient_mask(w, blend_height, False, True, blur)
    bottom_mask = create_gradient_mask(w, blend_height, False, False, blur)

    result = img.convert("RGBA")

    result.paste(bottom, (0, 0), bottom_mask)
    result.paste(top, (0, h - blend_height), top_mask)

    crop_t = blend_height // 2
    crop_b = h - (blend_height // 2)

    return result.crop((0, crop_t, w, crop_b))

def scale_to_height(img, target_height):
    if target_height is None:
        return img

    w, h = img.size
    new_width = int(w * (target_height / h))

    return img.resize((new_width, target_height), Image.LANCZOS)

def process_image(input_path, output_path, blend, blur, horizontal, vertical, target_height, trim_top, trim_bottom, trim_left, trim_right):
    img = Image.open(input_path)
    img = trim_vertical_percentage(img, trim_top, trim_bottom)
    img = trim_horizontal_percentage(img, trim_left, trim_right)

    if horizontal:
        img = seamless_horizontal(img, blend, blur)

    if vertical:
        img = seamless_vertical(img, blend, blur)

    img = scale_to_height(img, target_height)
    img.save(output_path)
    print(f"Saved: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Make an image seamless (horizontal and/or vertical)."
    )

    parser.add_argument("input", help="Input image file")
    parser.add_argument("-o", "--output", help="Output file (default: auto)")
    parser.add_argument("-b", "--blend", type=int, default=300,
                        help="Blend width/height in pixels (default: 300)")
    parser.add_argument("--blur", type=float, default=0,
                        help="Gaussian blur radius for mask (default: 0)")
    parser.add_argument("--horizontal", action="store_true",
                        help="Make seamless horizontally")
    parser.add_argument("--vertical", action="store_true",
                        help="Make seamless vertically")
    parser.add_argument("--height", type=int,
                        help="Resize output to this height (keeps aspect ratio)")
    parser.add_argument("--trim-top", type=float, default=0.0,
                        help="Trim percentage from top (0.0–1.0)")
    parser.add_argument( "--trim-bottom", type=float, default=0.0,
                        help="Trim percentage from bottom (0.0–1.0)")
    parser.add_argument( "--trim-left", type=float, default=0.0,
                        help="Trim percentage from left (0.0–1.0)")
    parser.add_argument( "--trim-right", type=float, default=0.0,
                        help="Trim percentage from right (0.0–1.0)")

    args = parser.parse_args()

    if not args.horizontal and not args.vertical:
        args.horizontal = True
    if not args.height:
        args.height = 632

    input_path = args.input

    if not args.output:
        name, ext = os.path.splitext(input_path)
        output_path = f"{name}-tiled.webp"
    else:
        output_path = args.output

    process_image(
        input_path,
        output_path,
        args.blend,
        args.blur,
        args.horizontal,
        args.vertical,
        args.height,
        args.trim_top,
        args.trim_bottom,
        args.trim_left,
        args.trim_right,
    )

if __name__ == "__main__":
    main()
