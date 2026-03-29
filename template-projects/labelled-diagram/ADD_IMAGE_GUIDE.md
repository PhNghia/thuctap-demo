# Adding the Akari.pdf Image to the Game

## Setup Status ✓
- ✓ Public folder structure created at: `public/img/Human/`
- ✓ Game is already configured to look for the image at: `/img/Human/Akari.pdf` or `/img/Human/Akari.png`
- ✓ Conversion scripts created for easy conversion

## How to Add Your Picture

### Option 1: Manual Conversion (Recommended)
1. **Save the PDF file**: Save your `Akari.pdf` to the project root directory
2. **Convert using an online tool**:
   - Go to https://cloudconvert.com (PDF to PNG)
   - Upload Akari.pdf
   - Download as Akari.png
3. **Place the file**: Copy Akari.png to `public/img/Human/Akari.png`
4. **Update the data path** (if needed):
   - Open `src/data/index.tsx`
   - Change `imagePath: "/img/Human/Akari.pdf"` to `imagePath: "/img/Human/Akari.png"`

### Option 2: Python Conversion (If System Tools Available)
1. Place `Akari.pdf` in project root
2. Run in terminal:
   ```bash
   python convert_pdf.py
   ```
3. The PNG will be automatically created at `public/img/Human/Akari.png`
4. Update data path in `src/data/index.tsx` if needed

### Option 3: Using an Image Instead
If you already have the image as PNG or JPG:
1. Save it as `Akari.png` or `Akari.jpg`
2. Place it in `public/img/Human/`
3. Update the path in `src/data/index.tsx` accordingly

## Project File Structure
```
public/
  img/
    Human/
      (your image goes here: Akari.png or Akari.jpg)
src/
  data/
    index.tsx  (configure image path here)
```

## Restart the Game
After adding the image:
1. The dev server will automatically hot-reload
2. Refresh your browser if needed
3. The game should now display your image!

## Next Steps
- Once the image is in place, you can define the drop zones by adjusting the coordinates in `src/data/index.tsx`
