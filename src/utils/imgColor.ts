export function getBestLogoColor(imageSrc: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Allow cross-origin image processing
        img.src = imageSrc;

        img.onload = function () {
            // Create a canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Unable to get canvas context."));
                return;
            }

            // Scale down the image for faster processing
            const scaledWidth = 50;
            const scaledHeight = (img.height / img.width) * scaledWidth;
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            // Draw the scaled image onto the canvas
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

            // Get the pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Calculate the best logo color
            const color = calculateAccurateDominantColor(imageData);
            resolve(color);
        };

        img.onerror = function () {
            reject(new Error("Error loading image."));
        };
    });
}

function calculateAccurateDominantColor(data: Uint8ClampedArray): string {
    const colorCounts: { [key: string]: number } = {};
    let maxWeight = 0;
    let bestColor: string | null = null;

    // Helper to convert RGB to HSL
    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0,
            s = 0,
            l = (max + min) / 2;

        if (max !== min) {
            const delta = max - min;
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
            if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;
            h /= 6;
        }

        return { h, s, l }; // h: [0,1], s: [0,1], l: [0,1]
    };

    // Helper to check if a color is suitable
    const isColorSuitable = (r: number, g: number, b: number) => {
        const { s, l } = rgbToHsl(r, g, b);
        return s > 0.2 && l > 0.2 && l < 0.8; // Exclude low saturation and very bright/dark colors
    };

    // Loop through pixel data (RGBA format)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3]; // Alpha channel

        // Skip fully transparent pixels
        if (a === 0) continue;

        // Skip unsuitable colors
        if (!isColorSuitable(r, g, b)) continue;

        const color = `${r},${g},${b}`; // Combine RGB values as a string

        // Weight color based on brightness and saturation
        const { s, l } = rgbToHsl(r, g, b);
        const weight = s * 100 + l * 50; // Adjust weights as needed

        colorCounts[color] = (colorCounts[color] || 0) + weight;

        // Update the best color
        if (colorCounts[color] > maxWeight) {
            maxWeight = colorCounts[color];
            bestColor = color;
        }
    }

    // Fallback to a neutral gray if no valid color is found
    return bestColor ? `rgb(${bestColor})` : "rgb(128,128,128)";
}
