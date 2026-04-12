"use client";

/**
 * Compresses an image file to a smaller size
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: 800)
 * @param maxHeight - Maximum height (default: 800)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns Promise resolving to a base64 data URL
 */
export function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses multiple image files
 * @param files - Array of image files
 * @param maxWidth - Maximum width (default: 800)
 * @param maxHeight - Maximum height (default: 800)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns Promise resolving to an array of base64 data URLs
 */
export function compressImages(
  files: File[],
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.7
): Promise<string[]> {
  return Promise.all(
    files.map(file => compressImage(file, maxWidth, maxHeight, quality))
  );
}
