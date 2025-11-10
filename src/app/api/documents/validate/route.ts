import { extractTextFromImage, extractTextFromPdf } from "@/helpers/fileOperation";
import { getDocType } from "@/helpers/ImageOperation";
import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

// Helper function to determine document type based on text content
// Helper function to determine document type based on text content


const extractLatestDate = (text: string) => {
    // Regular expression to match dates in formats: dd/MM/yyyy, dd-MM-yyyy, dd-MMM-yyyy
    const dateRegex = /\b\d{2}[\/-]\w{3,}[\/-]\d{2,4}\b|\b\d{2}[\/-]\d{2}[\/-]\d{2,4}\b/g;

    let latestDate: Date | null = null;

    // Find all matches
    const matches = text.match(dateRegex);

    if (!matches) return null;

    matches.forEach(dateStr => {
        let parsedDate = null;

        try {
            // Handle date parsing based on format
            if (dateStr.includes('/')) {
                parsedDate = parseDate(dateStr, 'dd/MM/yyyy');
            } else if (dateStr.includes('-')) {
                if (dateStr.split('-')[1].length === 3) {
                    parsedDate = parseDate(dateStr, 'dd-MMM-yyyy');
                } else {
                    parsedDate = parseDate(dateStr, 'dd-MM-yyyy');
                }
            }

            // Update latestDate if parsedDate is more recent
            if (parsedDate && (!latestDate || parsedDate > latestDate)) {
                latestDate = parsedDate;
            }
        } catch (e) {
            console.error(`Error parsing date: ${dateStr}`, e);
        }
    });

    return latestDate ? latestDate : null;
};

// Helper function to parse date according to format
const parseDate = (dateStr: string, format: string) => {
    const parts = dateStr.split(/[\/-]/);
    let day, month, year;

    switch (format) {
        case 'dd/MM/yyyy':
        case 'dd-MM-yyyy':
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1; // Month is zero-indexed in JS Date
            year = parseInt(parts[2], 10);
            break;
        case 'dd-MMM-yyyy':
            day = parseInt(parts[0], 10);
            month = parseMonth(parts[1]); // Custom month parsing function for short month names
            year = parseInt(parts[2], 10);
            break;
        default:
            return null;
    }

    // Adjust for 2-digit years
    if (year < 100) {
        year += year < 50 ? 2000 : 1900;
    }

    return new Date(year, month, day);
};

// Helper function to parse month from "MMM" format (e.g., "Jan", "Feb")
const parseMonth = (monthStr: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthStr);
};


export async function POST(req: Request) {
    const { user, error } = await verifyToken(req);

    if (!user || error) {
        return NextResponse.json({ error: 'Unauthorized User', status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded', status: 400 });
        }

        // Ensure `file` is treated as a Blob (for arrayBuffer to work)
        const fileBuffer = await file.arrayBuffer(); // Make sure this works correctly
        const fileType = file.type;

        let text: string;

        // Process the file based on the type
        if (fileType === 'application/pdf') {
            const pdfBuffer = Buffer.from(fileBuffer);
            text = await extractTextFromPdf(pdfBuffer);
        } else if (fileType.startsWith('image/')) {
            const imageBuffer = Buffer.from(fileBuffer);
            text = await extractTextFromImage(imageBuffer);
        } else {
            return NextResponse.json({ error: 'Unsupported file type', status: 400 });
        }

        // Determine the document type and extract validity
        const docType = getDocType(text);
        const validity = extractLatestDate(text);

        if(docType === 'Other' && !validity){
            return NextResponse.json({error : 'Failed to extract validity and type, Enter Manually', status : 402})
        }

        return NextResponse.json({ docType, validity, status: 200 });
    } catch (err) {
        console.error('Error processing file:', err);
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
    }
}
