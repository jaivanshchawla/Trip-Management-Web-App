

export function removeBackgroundFromImage(
  imageElement: HTMLImageElement,
  canvasElement: HTMLCanvasElement,
  options = {
    localWindowSize: 15,          // Size of local analysis window
    sensitivityThreshold: 0.15,   // Threshold for considering pixels as foreground
    contrastBoost: 1.3,          // Contrast enhancement factor
    denoiseLevel: 2,             // Level of noise reduction
    inkSpreadCompensation: 1.2,   // Compensation for ink spread
    adaptiveThresholdOffset: 10,  // Offset for adaptive thresholding
    edgeRefinementPasses: 2       // Number of edge refinement passes
  }
) {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  // Set canvas size to match the image
  canvasElement.width = imageElement.width;
  canvasElement.height = imageElement.height;

  // Draw the image on the canvas
  ctx.drawImage(imageElement, 0, 0);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const data = imageData.data;
  const width = canvasElement.width;
  const height = canvasElement.height;

  // Create arrays for processing
  const luminance = new Float32Array(width * height);
  const background = new Float32Array(width * height);
  const mask = new Uint8ClampedArray(width * height);

  // Step 1: Convert to luminance with ink spread compensation
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Enhanced luminance conversion for signature detection
    const lum = Math.pow(1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255, options.inkSpreadCompensation);
    luminance[i / 4] = lum;
  }

  // Step 2: Estimate local background intensity
  estimateBackground(luminance, background, width, height, options.localWindowSize);

  // Step 3: Apply adaptive thresholding with local contrast analysis
  applyAdaptiveThreshold(
    luminance,
    background,
    mask,
    width,
    height,
    options.sensitivityThreshold,
    options.adaptiveThresholdOffset
  );

  // Step 4: Refine edges and remove noise
  refineEdges(mask, luminance, width, height, options.edgeRefinementPasses);

  // Step 5: Apply the mask to the original image
  applyProcessedMask(data, mask, width, height, options.contrastBoost);

  // Put the processed image data back
  ctx.putImageData(imageData, 0, 0);
  return canvasElement.toDataURL();
}

// Estimate background intensity using local windows
function estimateBackground(
  luminance: Float32Array,
  background: Float32Array,
  width: number,
  height: number,
  windowSize: number
): void {
  const halfWindow = Math.floor(windowSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      let max = -Infinity;
      let min = Infinity;

      // Analyze local window
      for (let dy = -halfWindow; dy <= halfWindow; dy++) {
        for (let dx = -halfWindow; dx <= halfWindow; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const value = luminance[ny * width + nx];
            sum += value;
            count++;
            max = Math.max(max, value);
            min = Math.min(min, value);
          }
        }
      }

      // Calculate local statistics
      const mean = sum / count;
      const range = max - min;
      
      // Use weighted combination of mean and max for background estimation
      background[y * width + x] = range < 0.1 ? mean : (mean * 0.7 + max * 0.3);
    }
  }
}

// Apply adaptive thresholding with local contrast analysis
function applyAdaptiveThreshold(
  luminance: Float32Array,
  background: Float32Array,
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  sensitivityThreshold: number,
  offset: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const localContrast = calculateLocalContrast(luminance, width, height, x, y, 3);
      
      // Adaptive threshold based on local contrast and background
      const threshold = background[idx] + 
        (offset / 255) * (1 + localContrast) +
        sensitivityThreshold * (1 - background[idx]);

      mask[idx] = luminance[idx] > threshold ? 255 : 0;
    }
  }
}

// Calculate local contrast in a small window
function calculateLocalContrast(
  luminance: Float32Array,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
): number {
  let min = Infinity;
  let max = -Infinity;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const value = luminance[ny * width + nx];
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  }

  return max - min;
}

// Refine edges using morphological operations and connectivity analysis
function refineEdges(
  mask: Uint8ClampedArray,
  luminance: Float32Array,
  width: number,
  height: number,
  passes: number
): void {
  const temp = new Uint8ClampedArray(mask.length);
  
  for (let pass = 0; pass < passes; pass++) {
    // Copy current mask
    temp.set(mask);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        let connectedComponents = 0;

        // Check 8-connectivity
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nidx = (y + dy) * width + (x + dx);
            if (mask[nidx] > 127) connectedComponents++;
          }
        }

        // Analyze local structure
        const isEdge = connectedComponents > 0 && connectedComponents < 7;
        const lumGradient = calculateLocalContrast(luminance, width, height, x, y, 1);

        // Refine edge pixels based on local structure and gradient
        if (isEdge) {
          temp[idx] = lumGradient > 0.1 ? 255 : 0;
        }
      }
    }

    // Update mask
    mask.set(temp);
  }
}

// Apply the processed mask to the image data
function applyProcessedMask(
  data: Uint8ClampedArray,
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  contrastBoost: number
): void {
  for (let i = 0; i < mask.length; i++) {
    const idx = i * 4;
    const isForeground = mask[i] > 127;

    if (!isForeground) {
      // Make background transparent
      data[idx + 3] = 0;
    } else {
      // Enhance foreground
      for (let c = 0; c < 3; c++) {
        data[idx + c] = Math.min(255, Math.round(data[idx + c] * contrastBoost));
      }
      // Ensure foreground is fully opaque
      data[idx + 3] = 255;
    }
  }
}
