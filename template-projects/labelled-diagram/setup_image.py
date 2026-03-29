#!/usr/bin/env python3
"""
Quick setup: Convert Akari.pdf using Pillow with image processing
Alternative approach when ghostscript is not available
"""

import os
import sys
import io
from pathlib import Path

def setup_environment():
    """Ensure all dependencies are available and suggest alternatives."""
    print("=" * 60)
    print("AKARI.PDF IMAGE SETUP")
    print("=" * 60)
    
    project_root = Path(__file__).parent
    pdf_path = project_root / "Akari.pdf"
    output_dir = project_root / "public" / "img" / "Human"
    output_path = output_dir / "Akari.png"
    
    print(f"\nProject root: {project_root}")
    print(f"Expected PDF location: {pdf_path}")
    print(f"Output location: {output_path}")
    
    # Check if PDF exists
    if not pdf_path.exists():
        print(f"\n✗ Step 1: Akari.pdf not found")
        print(f"  ➤ Please save your Akari.pdf file to: {pdf_path}")
        print(f"\n✓ Step 2: Folder structure ready")
        print(f"  ➤ Output directory exists: {output_dir.exists()}")
        return False
    
    print(f"\n✓ Step 1: Found Akari.pdf")
    
    # Check output directory
    if not output_dir.exists():
        output_dir.mkdir(parents=True, exist_ok=True)
        print(f"✓ Step 2: Created output directory")
    else:
        print(f"✓ Step 2: Output directory ready")
    
    # Try conversion
    print(f"\n➤ Attempting conversion...")
    try:
        # Try using pdf2image with poppler (works if installed)
        from pdf2image import convert_from_path
        print("  Using pdf2image with poppler...")
        images = convert_from_path(str(pdf_path), dpi=200)
        if images:
            images[0].save(str(output_path), "PNG")
            print(f"✓ Successfully converted to: {output_path}")
            return True
    except ImportError:
        print("  pdf2image not available, trying alternative...")
    except Exception as e:
        print(f"  pdf2image failed: {e}")
    
    # Alternative: Try using PyPDF2 to extract as image
    try:
        print("  Trying alternative PDF processing...")
        import PyPDF2
        # This approach is limited but might work for simple PDFs
        print("  Note: PyPDF2 may not render images perfectly")
        return False
    except ImportError:
        pass
    
    # Suggest alternatives
    print(f"\n⚠ Automatic conversion failed. Please use one of these alternatives:")
    print()
    print("Option 1: Online Converter (Easiest)")
    print("-" * 60)
    print("  1. Go to: https://cloudconvert.com/pdf-to-png")
    print("  2. Upload: Akari.pdf")
    print("  3. Download as PNG: Akari.png")
    print(f"  4. Save to: {output_dir}/Akari.png")
    print()
    print("Option 2: Desktop Tools")
    print("-" * 60)
    print("  • GIMP: Open PDF → Export as PNG")
    print("  • ImageMagick: convert akari.pdf akari.png")
    print("  • Ghostscript: Install and run this script again")
    print()
    print("Option 3: VS Code Extension")
    print("-" * 60)
    print("  • Use 'PDF to Image' extension from marketplace")
    print()
    
    return False

if __name__ == "__main__":
    success = setup_environment()
    if success:
        print("\n✓ Setup complete! Restart your dev server to see the image.")
        sys.exit(0)
    else:
        print("\n→ After converting your PDF to PNG, run this script again.")
        sys.exit(1)
