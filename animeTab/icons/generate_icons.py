#!/usr/bin/env python3
"""
Otaku Tab Icon Generator
Creates PNG icons for the Chrome extension in multiple sizes.
Anime-themed design with modern aesthetics.
"""

import os
from PIL import Image, ImageDraw, ImageFont
import math

def create_otaku_icon(size):
    """Create an Otaku Tab icon with the specified size."""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions based on size
    center = size // 2
    outer_radius = int(size * 0.45)
    
    # Colors matching the app theme
    bg_color = (26, 26, 46, 255)      # --color-bg: #1a1a2e
    surface_color = (31, 34, 65, 255)  # --color-surface: #1f2241
    accent_color = (233, 69, 96, 255)  # --color-accent: #e94560
    text_color = (245, 246, 250, 255)  # --color-text: #f5f6fa
    
    # Draw main background circle with gradient effect
    for r in range(outer_radius, 0, -1):
        t = r / outer_radius
        # Blend from surface to bg color
        color = (
            int(surface_color[0] + (bg_color[0] - surface_color[0]) * t),
            int(surface_color[1] + (bg_color[1] - surface_color[1]) * t),
            int(surface_color[2] + (bg_color[2] - surface_color[2]) * t),
            255
        )
        draw.ellipse([center - r, center - r, center + r, center + r], fill=color)
    
    # Draw outer border
    border_width = max(1, size // 24)
    draw.ellipse([center - outer_radius, center - outer_radius,
                  center + outer_radius, center + outer_radius], 
                 outline=accent_color, width=border_width)
    
    # Draw stylized "O" for Otaku with anime aesthetic
    if size >= 32:
        # Main "O" character
        font_size = int(size * 0.5)
        inner_radius = int(size * 0.18)
        
        # Draw the "O" as a donut shape
        draw.ellipse([center - inner_radius - border_width*2, center - inner_radius - border_width*2,
                     center + inner_radius + border_width*2, center + inner_radius + border_width*2], 
                    fill=accent_color)
        draw.ellipse([center - inner_radius, center - inner_radius,
                     center + inner_radius, center + inner_radius], 
                    fill=(0, 0, 0, 0))  # Transparent center
        
        # Add small decorative elements (anime style sparkles)
        if size >= 48:
            sparkle_positions = [
                (center - outer_radius + 6, center - outer_radius + 8),
                (center + outer_radius - 8, center - outer_radius + 6),
                (center - outer_radius + 8, center + outer_radius - 6),
                (center + outer_radius - 6, center + outer_radius - 8)
            ]
            
            sparkle_size = max(2, size // 32)
            for x, y in sparkle_positions:
                # Draw small diamond sparkles
                points = [
                    (x, y - sparkle_size),
                    (x + sparkle_size, y),
                    (x, y + sparkle_size),
                    (x - sparkle_size, y)
                ]
                draw.polygon(points, fill=text_color)
    else:
        # Simplified version for smaller sizes
        inner_radius = int(size * 0.2)
        border_width = max(2, size // 8)
        
        draw.ellipse([center - inner_radius - border_width, center - inner_radius - border_width,
                     center + inner_radius + border_width, center + inner_radius + border_width], 
                    fill=accent_color)
        draw.ellipse([center - inner_radius, center - inner_radius,
                     center + inner_radius, center + inner_radius], 
                    fill=(0, 0, 0, 0))
    
    # Add subtle glow effect for larger icons
    if size >= 48:
        glow_radius = outer_radius + 3
        for i in range(3):
            alpha = 30 - (i * 10)
            glow_color = (*accent_color[:3], alpha)
            draw.ellipse([center - glow_radius - i, center - glow_radius - i,
                         center + glow_radius + i, center + glow_radius + i], 
                        outline=glow_color, width=1)
    
    return img

def create_alternative_icon(size):
    """Create an alternative icon design with tab/schedule theme."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Colors
    bg_color = (26, 26, 46, 255)
    surface_color = (31, 34, 65, 255)
    accent_color = (233, 69, 96, 255)
    text_color = (245, 246, 250, 255)
    
    # Draw rounded rectangle background
    corner_radius = size // 6
    margin = size // 8
    
    # Background with rounded corners (simplified)
    draw.rounded_rectangle([margin, margin, size - margin, size - margin], 
                          radius=corner_radius, fill=surface_color, 
                          outline=accent_color, width=max(1, size//24))
    
    # Draw grid pattern representing schedule/tabs
    if size >= 32:
        grid_margin = size // 4
        grid_spacing = (size - 2 * grid_margin) // 3
        
        for i in range(3):
            for j in range(3):
                if i == 1 and j == 1:  # Skip center for main element
                    continue
                    
                x = grid_margin + j * grid_spacing
                y = grid_margin + i * grid_spacing
                rect_size = grid_spacing // 3
                
                alpha = 180 if (i + j) % 2 == 0 else 120
                color = (*text_color[:3], alpha)
                
                draw.rectangle([x, y, x + rect_size, y + rect_size], 
                              fill=color)
        
        # Center element (larger, accent colored)
        center_size = grid_spacing // 2
        center_x = center - center_size // 2
        center_y = center - center_size // 2
        draw.rectangle([center_x, center_y, center_x + center_size, center_y + center_size], 
                      fill=accent_color)
    
    return img

def main():
    """Generate all icon sizes."""
    sizes = [16, 32, 48, 128]
    
    print("Generating Otaku Tab icons...")
    
    # Create icons directory if it doesn't exist
    os.makedirs(".", exist_ok=True)
    
    for size in sizes:
        # Primary design
        icon = create_otaku_icon(size)
        filename = f"icon{size}.png"
        icon.save(filename, "PNG")
        print(f"Created {filename} ({size}x{size})")
        
        # Alternative design (uncomment if you want both versions)
        # alt_icon = create_alternative_icon(size)
        # alt_filename = f"icon{size}_alt.png"
        # alt_icon.save(alt_filename, "PNG")
        # print(f"Created {alt_filename} ({size}x{size})")
    
    print("\nAll icons generated successfully!")
    print("\nIcon design concept:")
    print("- Dark theme background matching app colors")
    print("- Stylized 'O' for Otaku in accent color")
    print("- Anime-style sparkle decorations")
    print("- Gradient and glow effects")
    print("- Modern, clean aesthetic")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("PIL (Pillow) not installed. Please install with:")
        print("pip install Pillow")
        print("\nThen run this script again to generate icons.")
    except Exception as e:
        print(f"Error generating icons: {e}")
