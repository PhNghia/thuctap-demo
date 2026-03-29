#!/usr/bin/env node

/**
 * Simple PDF to PNG converter using node-pdf-parse and canvas
 * Run: node convert_pdf_node.mjs Akari.pdf
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('PDF Conversion Tool');
console.log('==================');
console.log('\nTo convert your Akari.pdf to PNG:');
console.log('\n1. Place "Akari.pdf" in this directory');
console.log('2. Run: npm install pdf-parse pdfjs-dist canvas');
console.log('3. Then run: node convert_pdf_node.mjs');
console.log('\nAlternatively, you can:');
console.log('- Use an online PDF to PNG converter');
console.log('- Use a desktop tool like ImageMagick or GIMP');
console.log('- Run the Python script: python convert_pdf.py');
console.log('\nOnce converted, the PNG file should be at:');
console.log(path.join(__dirname, 'public/img/Human/Akari.png'));
