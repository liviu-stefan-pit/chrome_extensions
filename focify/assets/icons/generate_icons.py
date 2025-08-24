#!/usr/bin/env python3
"""
Focify Icon Generator
Creates PNG icons for the Chrome extension in multiple sizes.
"""

import os
from PIL import Image, ImageDraw
import math

def create_focify_icon(size):
    """Create a Focify icon with the specified size."""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions based on size
    center = size // 2
    outer_radius = int(size * 0.44)  # 44% of size
    
    # Colors (purple gradient effect)
    bg_color = (102, 126, 234, 255)  # #667eea
    accent_color = (240, 147, 251, 255)  # #f093fb
    white = (255, 255, 255, 255)
    
    # Draw main background circle
    draw.ellipse([center - outer_radius, center - outer_radius, 
                  center + outer_radius, center + outer_radius], 
                 fill=bg_color, outline=white, width=max(1, size//32))
    
    # Draw concentric focus circles
    for i, radius_ratio in enumerate([0.25, 0.16, 0.06]):
        radius = int(size * radius_ratio)
        if radius > 0:
            alpha = 180 + (i * 25)  # Increasing opacity
            color = (*accent_color[:3], alpha)
            
            if i == 2:  # Innermost circle - filled
                draw.ellipse([center - radius, center - radius,
                             center + radius, center + radius], 
                            fill=accent_color)
            else:  # Outer circles - just outline
                width = max(1, size // 64)
                draw.ellipse([center - radius, center - radius,
                             center + radius, center + radius], 
                            outline=color, width=width)
    
    # Draw rays (focus beams)
    if size >= 32:  # Only draw rays for larger icons
        ray_length = int(size * 0.06)
        ray_start = int(size * 0.31)
        ray_width = max(1, size // 64)
        
        for angle in range(0, 360, 45):  # 8 rays
            rad = math.radians(angle)
            start_x = center + int(ray_start * math.cos(rad))
            start_y = center + int(ray_start * math.sin(rad))
            end_x = center + int((ray_start + ray_length) * math.cos(rad))
            end_y = center + int((ray_start + ray_length) * math.sin(rad))
            
            draw.line([start_x, start_y, end_x, end_y], 
                     fill=(*white[:3], 180), width=ray_width)
    
    return img

def main():
    """Generate all icon sizes."""
    sizes = [16, 32, 48, 128]
    
    print("Generating Focify icons...")
    
    for size in sizes:
        icon = create_focify_icon(size)
        filename = f"icon{size}.png"
        icon.save(filename, "PNG")
        print(f"Created {filename} ({size}x{size})")
    
    print("All icons generated successfully!")
    print("\nIcon design:")
    print("- Purple gradient background circle")
    print("- Concentric circles representing focus")
    print("- Radiating lines representing filtering")
    print("- Abstract and modern design")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("PIL (Pillow) not installed. Please install with: pip install Pillow")
        print("Or use the icon-generator.html file to create icons manually.")
