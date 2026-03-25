export const getBrightness = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const w = 50, h = 50;
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);

      const data = ctx.getImageData(0, 0, w, h).data;

      let r = 0, g = 0, b = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const pixels = data.length / 4;

      r /= pixels;
      g /= pixels;
      b /= pixels;

      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      resolve(brightness);
    };

    img.onerror = () => resolve(128); // default brightness
  });
};