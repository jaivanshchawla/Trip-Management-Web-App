import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import pdf from 'pdf-parse-new';
import sharp from 'sharp'
import tesseract from 'node-tesseract-ocr';
import { PDFDocument } from 'pdf-lib';

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
});

// Function to compress PDF files
async function compressPDF(pdfBuffer) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Compress PDF by removing object streams, or you can apply other optimizations here
    const optimizedPdfBuffer = await pdfDoc.save({
        useObjectStreams: false, // This can slightly reduce the size
    });

    return Buffer.from(optimizedPdfBuffer);
}

// Function to handle image or PDF compression and upload to S3
export async function uploadFileToS3(
    fileBuffer,
    fileName,
    contentType
) {
    let optimizedBuffer = fileBuffer;

    // Compress image if the content type is image
    if (contentType.startsWith('image/')) {
        optimizedBuffer = await sharp(fileBuffer)
            .resize({
                width: 1200, // Resize image to a maximum width of 1200px (optional)
                fit: sharp.fit.inside, // Maintain aspect ratio
            })
            .toBuffer();
    }

    // Compress PDF if the content type is a PDF
    if (contentType === 'application/pdf') {
        optimizedBuffer = await compressPDF(fileBuffer);
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return fileName;
}

export const deleteFileFromS3 = async (fileUrl) => {
    try {
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      
      // Extract file key from URL
      const fileKey = fileUrl.split(`https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`)[1];
      
      if (!fileKey) {
        throw new Error("Invalid S3 file URL");
      }
  
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });
  
      await s3Client.send(command);
      console.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw new Error("Failed to delete file from S3");
    }
  };

/**
 * Generate a presigned URL for sharing a document
 * @param {string} fileUrl - The S3 file URL from database (exact URL, no modifications)
 * @param {number} expiresIn - Expiration time in seconds (default: 48 hours)
 * @returns {Promise<string>} Presigned URL for temporary public access
 */
export async function getPresignedUrl(
  fileUrl,
  expiresIn = 172800 // 48 hours in seconds
) {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    // Extract the exact S3 key from the URL without any modifications
    let fileKey;
    
    if (fileUrl.includes('amazonaws.com/')) {
      // Use URL parsing to extract the pathname correctly
      const url = new URL(fileUrl);
      // Remove leading slash and decode URI components to get exact key
      fileKey = decodeURIComponent(url.pathname.substring(1));
    } else if (fileUrl.includes('s3://')) {
      // Handle s3:// protocol format
      fileKey = fileUrl.replace(`s3://${bucketName}/`, '');
      fileKey = decodeURIComponent(fileKey);
    } else {
      // Assume it's already a key
      fileKey = decodeURIComponent(fileUrl);
    }
    
    if (!fileKey) {
      throw new Error("Invalid S3 file URL");
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    
    // Check if it's a NoSuchKey error
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
      throw new Error("File not found");
    }
    
    throw new Error("Failed to generate presigned URL");
  }
}


export async function extractValidityDate(text) {
    const regex = /(?:valid|vahd)?\s*upto\s*[:\-]?\s*(\d{2})\/(\d{2})\/(\d{4})/i

    const match = text.match(regex);

    if (match) {
        const [_, day, month, year] = match;
        return new Date(`${year}-${month}-${day}`);
    }

    return null;
}

// Function to extract text from a PDF using pdf-parse
export async function extractTextFromPdf(buffer) {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
}

async function preprocessImage(buffer) {
    const preprocessedBuffer = await sharp(buffer)
        .resize({ width: 1500 })  // Resize for better OCR accuracy
        .grayscale()  // Convert to grayscale
        .normalize()  // Normalize to enhance contrast
        .sharpen({
            sigma: 1,  // Controls the amount of blur applied before calculating the difference (higher values mean less sharpening)
            m1: 1,     // Controls the level of sharpening (mid-tone)
            m2: 0.5,   // Controls the level of sharpening (shadow area)
            x1: 2,     // Threshold below which the pixels are left unchanged
            y2: 10,    // Controls the range of sharpening applied (upper bound for adjustment)
            y3: 2      // Controls the range of sharpening applied (lower bound for adjustment)
        })
        .median(3)  // Apply median filter to reduce noise
        .threshold(180)  // Binarize the image
        .removeAlpha()  // Remove alpha channel if present
        .toBuffer();

    return preprocessedBuffer;
}

// Function to extract text from an image using node-tesseract-ocr
export async function extractTextFromImage(buffer) {
    const preprocessedBuffer = await preprocessImage(buffer);
    const text = await tesseract.recognize(preprocessedBuffer, {
        lang: "eng",
        psm: 3,  // Try different PSM values
        oem: 3,  // Use the best OCR Engine mode
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/:', // Whitelist for known characters
    });
    return text;
}
