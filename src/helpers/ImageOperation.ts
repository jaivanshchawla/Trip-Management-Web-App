export function getDocType(text: string): string {
    const docTypes = [
        { keywords: ['National Permit Authorization Number', 'AUTHORIZATION CERTIFICATE OF N.P.'], type: 'Permit' },
        { keywords: ['CERTIFICATE OF REGISTRATION', 'Form 23A'], type: 'Registration Certificate' },
        { keywords: ['INSURANCE COMPANY', 'Period of Insurance'], type: 'Insurance' },
        { keywords: ['TAX RECEIPT', 'Transport Department'], type: 'Tax Receipt' },
        { keywords: ['E-Way Bill', 'EWB'], type: 'E-Way Bill' },
        { keywords: ['Bilty'], type: 'Bilty' },
        { keywords: ['Proof of Delivery', 'POD'], type: 'POD' },
        { keywords: ['Expense Receipt', 'Receipt'], type: 'Expense Receipt' },
        { keywords: ['PAN', 'Permanent Account Number'], type: 'PAN' },
        { keywords: ['Police Verification'], type: 'Police Verification' },
        { keywords: ['Aadhar', 'Aadhaar', 'Unique Identification Number'], type: 'Aadhar Card' },
        { keywords: ['License', 'Driving License','DLNo.'], type: 'License' },
        { keywords: ['Pollution Certificate', 'Pollution Under Control'], type: 'Pollution Certificate' },
        { keywords: ['fitness', 'Fitness','Certificate of Fitness'], type : 'Fitness Certificate'}
    ];

    // Normalize text to lowercase for case-insensitive matching
    const lowerCaseText = text.toLowerCase();

    for (const doc of docTypes) {
        // Check if any of the keywords are present in the text (flexible matching)
        if (doc.keywords.some(keyword => lowerCaseText.includes(keyword.toLowerCase()))) {
            return doc.type;
        }
    }

    return 'Other';
}


export const extractLatestDate = (text: string) => {
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
export const parseDate = (dateStr: string, format: string) => {
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
export const parseMonth = (monthStr: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthStr);
};
