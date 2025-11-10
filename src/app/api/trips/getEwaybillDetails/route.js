import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { model, models } from "mongoose";
import { tripSchema } from "@/utils/schema";
import pdf from 'pdf-parse-new';
import sharp from 'sharp'
import tesseract from 'node-tesseract-ocr';

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
});

const Trip = models.Trip || model('Trip', tripSchema);


function extractTripDetails(text: string) {
    const originRegex = /From\s+.*Pincode:-\s*(\d{6})/;
    const destinationRegex = /To\s+.*Pincode:-\s*(\d{6})/;
    const startDateRegex = /Generated Date:(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\s+\w{2})/;
    const freightAmountRegex = /Total Inv\.Amt\s*(\d+\.\d{2})/;
    const truckNumberRegex = /Vehicle\s*\/\s*Trans\s*Doc\s*No\s*&\s*Dt\.\s*.*\nRoad([A-Z]{2}\d{2}[A-Z]{1,2}\d{4})/;

    const originMatch = text.match(originRegex);
    const destinationMatch = text.match(destinationRegex);
    const startDateMatch = text.match(startDateRegex);
    const freightAmountMatch = text.match(freightAmountRegex);
    const truckNumberMatch = text.match(truckNumberRegex);

    const origin = originMatch ? originMatch[1] : null;
    const destination = destinationMatch ? destinationMatch[1] : null;
    const startDate = startDateMatch ? startDateMatch[1] : null;
    const freightAmount = freightAmountMatch ? freightAmountMatch[1] : null;
    const truckNumber = truckNumberMatch ? truckNumberMatch[1] : null;

    return {
        origin,
        destination,
        startDate,
        freightAmount,
        truckNumber
    };
}

async function uploadFileToS3(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileName;
}

async function extractValidityDate(text: string) {
    const prompt = `
                This is extracted text from pdf extract these details from it i.e origin, destination, freight amount (total invoice amount), start date(the generation date of the document), truckNo, validity date. Give all this in JSON format
    
                Extracted Text:
                ${text}

                Response Object format :
                {
                    startDate : '',
                    origin : '',
                    destination : '',
                    validity : '',
                    truckNo : '',
                }
            `;

    // Send the prompt and extracted text to the Gemini API
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        })
    });
    const responseData = await res.json();
    let responseText = responseData.candidates[0].content.parts[0].text;

    // Remove extraneous characters (e.g., triple backticks, other non-JSON text)
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse the cleaned string into a JSON object
    const jsonObject = JSON.parse(responseText);
    console.log(jsonObject)
    return jsonObject
}

// Function to extract text from a PDF using pdf-parse
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer);
        console.log(extractTripDetails(data.text))
        return data.text;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
}

async function preprocessImage(buffer: Buffer): Promise<Buffer> {
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
async function extractTextFromImage(buffer: Buffer): Promise<string> {
    const preprocessedBuffer = await preprocessImage(buffer);
    const text = await tesseract.recognize(preprocessedBuffer, {
        lang: "eng",
        psm: 3,  // Try different PSM values
        oem: 3,  // Use the best OCR Engine mode
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/:', // Whitelist for known characters
    });
    return text;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        // const tripId = formData.get("tripId") as string;
        let ewbValidityDate = formData.get('ewbValidityDate') ? new Date(formData.get('ewbValidityDate') as string) : null;

        // if (!file || !tripId) {
        //     return NextResponse.json({ error: "File and tripId are required." }, { status: 400 });
        // }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        // const fileName = `trips/ewaybill-${tripId}`;
        const contentType = file.type;

        // If ewbValidityDate is not provided, extract it from the file
        
            if (contentType === "application/pdf") {
                // Extract text from PDF using pdf-parse
                const pdfText = await extractTextFromPdf(fileBuffer);
                ewbValidityDate = await extractValidityDate(pdfText);
            } else if (contentType.startsWith("image/")) {
                // Extract text from image using node-tesseract-ocr
                const imageText = await extractTextFromImage(fileBuffer);
                ewbValidityDate = await extractValidityDate(imageText);
            }

            // If ewbValidityDate is still null, return an error response
            if (!ewbValidityDate) {
                return NextResponse.json({
                    success: false,
                    message: "Failed to extract validity date. Please enter it manually.",
                });
            }
        

        // Upload the file to S3
        // const s3FileName = await uploadFileToS3(fileBuffer, fileName, contentType);
        // const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3FileName}${contentType === 'application/pdf' ? '.pdf' : ''}`;

        // Update the Trip document with the E-Way Bill URL and validity date
        // const trip = await Trip.findOneAndUpdate(
        //     { trip_id: tripId },
        //     { ewayBill: fileUrl, ewbValidityDate },
        //     { new: true }
        // );

        return NextResponse.json({ success: true, ewbValidityDate });
    } catch (error) {
        console.error("Error uploading e-way bill:", error);
        return NextResponse.json({ error: "Failed to upload e-way bill." }, { status: 500 });
    }
}
