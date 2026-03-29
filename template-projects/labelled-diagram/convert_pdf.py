#!/usr/bin/env python3
"""
Convert PDF to PNG image for the diagram game.
"""

import os
from pdf2image import convert_from_path
from PIL import Image

def convert_pdf_to_png(pdf_path, output_dir):
    """Convert PDF to PNG image."""
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        return False
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=200)
        
        # Save the first page as PNG
        if images:
            output_path = os.path.join(output_dir, "Akari.png")
            images[0].save(output_path, "PNG")
            print(f"✓ Successfully converted {pdf_path} to {output_path}")
            return True
        else:
            print("Error: No pages found in PDF")
            return False
    except Exception as e:
        print(f"Error during conversion: {e}")
        print("Make sure ghostscript is installed on your system")
        return False

if __name__ == "__main__":
    # Get the public img/Human directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "public", "img", "Human")
    
    # Look for Akari.pdf in the script directory
    pdf_path = os.path.join(script_dir, "Akari.pdf")
    
    if os.path.exists(pdf_path):
        convert_pdf_to_png(pdf_path, output_dir)
    else:
        print(f"Please place your Akari.pdf file at: {pdf_path}")
        print("Then run this script again.")
