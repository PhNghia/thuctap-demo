#!/usr/bin/env python3
"""
Convert Akari.pdf to Akari.png
This script uses tried-and-tested conversion methods
"""

import os
import sys
from pathlib import Path

def main():
    project_root = Path(__file__).parent
    pdf_path = project_root / "Akari.pdf"
    output_dir = project_root / "public" / "img" / "Human"
    output_path = output_dir / "Akari.png"
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if not pdf_path.exists():
        print("❌ ERROR: Akari.pdf not found in project root")
        print(f"\nExpected location: {pdf_path}")
        print("\nPlease save your Akari.pdf file there, then run this script again.")
        sys.exit(1)
    
    print(f"📄 Found: {pdf_path}")
    print(f"📍 Output: {output_path}")
    print("\nAttempting conversion...")
    
    # Try Method 1: pdf2image with Poppler
    try:
        from pdf2image import convert_from_path
        print("  → Using pdf2image (Poppler)...")
        images = convert_from_path(str(pdf_path), dpi=200)
        if images:
            images[0].save(str(output_path), "PNG")
            print(f"✅ SUCCESS! Image saved to: {output_path}")
            print("\n🔄 Restart your dev server to see the image.")
            return True
    except ImportError:
        print("  ℹ pdf2image not available")
    except Exception as e:
        print(f"  ⚠ pdf2image failed: {e}")
    
    # Try Method 2: fitz (PyMuPDF)
    try:
        import fitz  # PyMuPDF
        print("  → Using PyMuPDF...")
        doc = fitz.open(str(pdf_path))
        pix = doc[0].get_pixmap(matrix=fitz.Matrix(2, 2))
        pix.save(str(output_path))
        doc.close()
        print(f"✅ SUCCESS! Image saved to: {output_path}")
        print("\n🔄 Restart your dev server to see the image.")
        return True
    except ImportError:
        print("  ℹ PyMuPDF not available")
    except Exception as e:
        print(f"  ⚠ PyMuPDF failed: {e}")
    
    # Try Method 3: PIL/Pillow (limited, may not work well)
    try:
        from PIL import Image
        print("  → Trying PIL (limited support)...")
        img = Image.open(str(pdf_path))
        img.save(str(output_path), "PNG")
        print(f"✅ Image saved to: {output_path} (may need adjustment)")
        return True
    except Exception as e:
        print(f"  ⚠ PIL failed: {e}")
    
    print("\n" + "="*60)
    print("❌ Automatic conversion failed.")
    print("="*60)
    print("\n📋 Alternative Solutions:\n")
    print("1. ONLINE CONVERTER (No installation needed)")
    print("   • Go to: https://cloudconvert.com/pdf-to-png")
    print("   • Upload: Akari.pdf")
    print("   • Download: Akari.png")
    print(f"   • Save to: {output_dir.relative_to(project_root)}/\n")
    
    print("2. INSTALL DEPENDENCIES")
    print("   • For pdf2image (recommended):")
    print("     pip install pdf2image")
    print("     # Then install Poppler (see: https://poppler.freedesktop.org/)\n")
    
    print("   • For PyMuPDF:")
    print("     pip install PyMuPDF\n")
    
    print("3. DESKTOP TOOLS")
    print("   • GIMP: File → Open → Export as PNG")
    print("   • Adobe Reader: File → Export → Image → PNG\n")
    
    sys.exit(1)

if __name__ == "__main__":
    main()
