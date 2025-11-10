# PowerShell script to remove TypeScript type annotations from route.js files

$files = Get-ChildItem -Path "src/app/api" -Filter "route.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remove type annotations from function parameters
    $content = $content -replace '(req|request|params|data|error|user|body|formData|file|url|query|edited|charge|expense|invoice|document|trip|truck|driver|party|supplier|account|newExpense|newCharge|newPayment|newDocument|newInvoice|newTrip|oldTrip|updatedTrip|savedTrip|eWayBillDoc|existingDocIndex|commonDocFields|uploadedDocuments|fileData|filesData|s3FileName|fileUrl|fileBuffer|fileName|contentType|validity|ewbValidityDate|pdfText|imageText|text|docType|reciptDetails|shareUrl|expiresIn|notificationPayload|fcm_token|updatedToken|tripReminders|truckReminders|driverReminders|allDocuments|tripDocumentsCount|driverDocumentsCount|truckDocumentsCount|userDocumentsCount|otherDocumentsCount|tripResults|driverResults|truckResults|userResults|otherResults|tripExpense|truckExpense|officeExpense|combinedExpenses|totalExpense|expenses|expensesSummary|dateConditions|monthNumber|startDate|endDate|currentDate|currentYear|financialYearStart|financialYearEnd|filter|monthYear|monYear|month|year|paymentModes|shops|expenseTypes|drivers|trucks|trips|charges|pending|balance|revenue|partyName|driverName|shopName|tripRoute|accounts|invoices|newInvoice|debugPipeline|latestDate|matches|dateStr|parsedDate|day|parts|months|monthStr|monthMap|oneWeekAgo|oneWeekFromNow|Model|modelName|schema|userId|projectionFields|bulkOperations|paymentUpdates|chargeUpdates|payments|results|editedPayments|editedCharges|deletedChargeIds|deletedPaymentIds|newPayments|newCharges|isTripCompleted|errorMapping|message|status|rawDate|podImage|dates|notes|base64String|base64Data|Truck|Driver|Trip|TripCharges|TripExpense|SupplierAccount|Expense|Invoice|OtherDocuments|FcmToken|DraftExpense|UserExpenseType|Party|Supplier|PartyPayments|OfficeExpense|User):\s*(Request|NextRequest|Response|NextResponse|File|string|number|boolean|Date|any|void|Promise<[^>]+>|Record<[^>]+>|\{[^}]+\}|\[[^\]]+\])', '$1'
    
    # Remove type-only imports
    $content = $content -replace 'import\s+type\s+\{[^}]+\}\s+from\s+[''"][^''"]+[''"];?\s*\n', ''
    
    # Remove interface/type imports from @/utils/interface
    $content = $content -replace 'import\s+\{[^}]*I[A-Z][^}]*\}\s+from\s+[''"]@/utils/interface[''"];?\s*\n', ''
    
    # Remove specific type annotations
    $content = $content -replace ':\s*any\b', ''
    $content = $content -replace ':\s*string\b', ''
    $content = $content -replace ':\s*number\b', ''
    $content = $content -replace ':\s*boolean\b', ''
    $content = $content -replace ':\s*Date\b', ''
    $content = $content -replace ':\s*void\b', ''
    $content = $content -replace ':\s*Promise<[^>]+>', ''
    $content = $content -replace 'as\s+(File|string|number|boolean|any)\b', ''
    $content = $content -replace '\|\s*null\b', ''
    
    # Remove Record type annotations
    $content = $content -replace ':\s*Record<[^>]+>', ''
    
    # Remove object type annotations
    $content = $content -replace ':\s*\{[^}]+message:\s*string[^}]+\}', ''
    
    # Remove array type annotations  
    $content = $content -replace ':\s*\{[^}]+\}\[\]', ''
    
    # Remove params type annotations
    $content = $content -replace ',\s*\{\s*params\s*\}:\s*\{\s*params:\s*\{[^}]+\}\s*\}', ', { params }'
    
    # Remove NextApiRequest and NextApiResponse
    $content = $content -replace 'NextApiRequest|NextApiResponse', ''
    
    # Clean up extra spaces
    $content = $content -replace '\s+,', ','
    $content = $content -replace ',\s+\)', ')'
    $content = $content -replace '\(\s+', '('
    $content = $content -replace '\s+\{', ' {'
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Processed: $($file.FullName)"
}

Write-Host "Conversion complete!"
