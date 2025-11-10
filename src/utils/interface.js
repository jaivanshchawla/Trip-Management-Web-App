// interfaces/Driver.js

/**
 * @typedef {Object} InvoiceFormData
 * @property {string} [color]
 * @property {string} rate
 * @property {string} billingtype
 * @property {string} logoUrl
 * @property {string} billNo
 * @property {string} partygst
 * @property {string} partyAddress
 * @property {string} date
 * @property {string} to
 * @property {string} from
 * @property {string} branch
 * @property {string} address
 * @property {string} particulars
 * @property {string} party
 * @property {string} companyName
 * @property {string} phone
 * @property {string} [altPhone]
 * @property {string} email
 * @property {string} signatureUrl
 * @property {string} stampUrl
 * @property {string} dueDate
 * @property {"IGST" | "SGST + CGST" | ""} [gstType]
 * @property {number} [gst]
 * @property {Array<{lrNo: string, truckNo: string, material: string[], date: string, weight: string, charged: string, rate: string, amount: number}>} freightCharges
 * @property {Array<{id: string, date: string, truckNo: string, expenseType: string, notes: string, amount: number, edited: boolean}>} additionalCharges
 * @property {Array<{id: string, date: string, partyBill: boolean, truckNo: string, expenseType: string, notes: string, amount: number, trip_id: string}>} extraAdditionalCharges
 * @property {{msmeNo: string, gstin: string, pan: string, accNo: string, ifscCode: string, bankName: string, bankBranch: string}} partyDetails
 * @property {Array<{id: string, date: string, paymentType: string, notes: string, amount: number, edited: boolean}>} paymentDetails
 * @property {Array<{id: string, date: string, party_id: string, paymentType: string, accountType: string, notes: string, amount: number, driver_id?: string}>} extraPaymentDetails
 */

/**
 * @typedef {Object} IDriverAccount
 * @property {string} account_id
 * @property {Date} date
 * @property {string} reason
 * @property {number} gave
 * @property {number} got
 */

/**
 * @typedef {Object} invData
 * @property {string} user_id
 * @property {number} invoiceNo
 * @property {number} advance
 * @property {string} party_id
 * @property {Date} date
 * @property {Date} dueDate
 * @property {{origin: string, destination: string}} route
 * @property {number} balance
 * @property {string} invoiceStatus
 * @property {number} total
 * @property {string[]} trips
 */

/**
 * @typedef {Object} IDriver
 * @property {string} driver_id
 * @property {string} name
 * @property {string} contactNumber
 * @property {string} licenseNo
 * @property {string} aadharNo
 * @property {Date} lastJoiningDate
 * @property {'Available' | 'On Trip'} status
 * @property {number} [balance]
 * @property {IDriverAccount[]} accounts
 */

/**
 * @typedef {Object} PaymentBook
 * @property {string} _id
 * @property {string} paymentBook_id
 * @property {string} accountType
 * @property {number} amount
 * @property {'Cash' | 'Cheque' | 'Online Transfer'} paymentType
 * @property {boolean} receivedByDriver
 * @property {Date} date
 * @property {string} [notes]
 * @property {string} [driver_id]
 */

/**
 * @typedef {Object} Route
 * @property {string} origin
 * @property {string} destination
 */

/**
 * @typedef {Object} TripExpense
 * @property {string} trip_id
 * @property {boolean} partyBill
 * @property {number} amount
 * @property {Date} date
 * @property {string} expenseType
 * @property {string} [notes]
 */

/**
 * @typedef {Object} ITrip
 * @property {string} trip_id
 * @property {number} [advance]
 * @property {string} party
 * @property {string} truck
 * @property {string} driver
 * @property {string} supplier
 * @property {Route} route
 * @property {'Fixed' | 'Per Tonne' | 'Per Kg' | 'Per Trip' | 'Per Day' | 'Per Hour' | 'Per Litre' | 'Per Bag'} billingType
 * @property {number} amount
 * @property {Date} startDate
 * @property {number} truckHireCost
 * @property {string} LR
 * @property {string} [fmNo]
 * @property {0 | 1 | 2 | 3 | 4} [status]
 * @property {string} [POD]
 * @property {Date[]} dates
 * @property {string} [notes]
 * @property {PaymentBook[]} accounts
 * @property {PaymentBook[]} [tripAccounts]
 * @property {number} [advanceTotal]
 * @property {string} ewayBill
 * @property {Date} ewbValidityDate
 * @property {Array<{filename: string, type: string, validityDate: Date, uploadedDate: Date, url: string}>} documents
 * @property {string} partyName
 * @property {boolean} invoice
 * @property {number} balance
 * @property {number} [units]
 * @property {number} [rate]
 * @property {string} [invoice_id]
 * @property {Array<{name: string, weight: string}>} [material]
 * @property {string} [guaranteedWeight]
 * @property {{balance?: number, advance?: number, charges?: number, haltingCharges?: number, length?: number, width?: number, height?: number}} [loadingSlipDetails]
 */

/**
 * @typedef {Object} Idoc
 * @property {string} filename
 * @property {string} type
 * @property {Date} validityDate
 * @property {Date} uploadedDate
 * @property {string} url
 */

/**
 * @typedef {Object} IParty
 * @property {string} user_id
 * @property {string} party_id
 * @property {string} name
 * @property {string} contactPerson
 * @property {string} contactNumber
 * @property {string} address
 * @property {string} gstNumber
 * @property {number} balance
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {string} email
 * @property {string} pan
 * @property {number} partyBalance
 */

/**
 * @typedef {Object} TruckModel
 * @property {string} truckNo
 * @property {string} truck_id
 * @property {string} truckType
 * @property {any} model
 * @property {string} capacity
 * @property {string | null} bodyLength
 * @property {string} ownership
 * @property {string} supplier
 * @property {'Available' | 'On Trip'} status
 * @property {string} trip_id
 * @property {Array} documents
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {string} driver_id
 */

/**
 * @typedef {Object} ISupplier
 * @property {string} supplier_id
 * @property {string} name
 * @property {string} contactNumber
 * @property {number} balance
 */

/**
 * @typedef {Object} IExpense
 * @property {string} user_id
 * @property {string} trip_id
 * @property {string} truck
 * @property {string} expenseType
 * @property {string} paymentMode
 * @property {string} [transaction_id]
 * @property {string} [driver]
 * @property {number} amount
 * @property {Date} date
 * @property {string} [notes]
 */

/**
 * @typedef {Object} ITripCharges
 * @property {string} user_id
 * @property {string} trip_id
 * @property {boolean} partyBill
 * @property {number} amount
 * @property {Date} date
 * @property {string} expenseType
 * @property {string} [notes]
 */

/**
 * @typedef {Object} ISupplierAccount
 * @property {string} user_id
 * @property {string} supplier_id
 * @property {string} trip_id
 * @property {number} amount
 * @property {string} paymentMode
 * @property {string} date
 * @property {string} notes
 * @property {string} refNo
 */

/**
 * @typedef {Object} ConsignerConsigneeType
 * @property {string} gstNumber
 * @property {string} name
 * @property {string} address
 * @property {string} city
 * @property {string} pincode
 * @property {string} contactNumber
 */

/**
 * @typedef {Object} EWBFormDataType
 * @property {string} gstNumber
 * @property {string} pan
 * @property {string} companyName
 * @property {string} address
 * @property {string} city
 * @property {string} pincode
 * @property {string} from
 * @property {string} to
 * @property {string} contactNumber
 * @property {string} [altPhone]
 * @property {string} email
 * @property {Date} date
 * @property {string} LR
 * @property {ConsignerConsigneeType} consigner
 * @property {ConsignerConsigneeType} consignee
 * @property {Array<{name: string, weight: string}>} materials
 * @property {string} weight
 * @property {string} unit
 * @property {'consigner' | 'consignee' | 'agent'} paidBy
 * @property {string} ewayBillNo
 * @property {string} invoiceNo
 * @property {string} truckNo
 * @property {string} logo
 * @property {string} signature
 * @property {string | number} value
 * @property {string | number} grtdWeight
 */

/**
 * @typedef {Object} FMDataType
 * @property {string} gstNumber
 * @property {string} rate
 * @property {string} pan
 * @property {string} companyName
 * @property {string} [ownerName]
 * @property {string} [supplierName]
 * @property {string} [userName]
 * @property {string} address
 * @property {string} city
 * @property {string} pincode
 * @property {string} [altPhone]
 * @property {string} contactNumber
 * @property {string} email
 * @property {Date} date
 * @property {string} challanNo
 * @property {string} from
 * @property {string} to
 * @property {string} totalFreight
 * @property {string} commision
 * @property {string} weight
 * @property {Array<{name: string, weight: string}>} material
 * @property {string} unit
 * @property {string} noOfBags
 * @property {string} vehicleOwner
 * @property {string} advance
 * @property {string} hamali
 * @property {string} extraWeight
 * @property {string} billingtype
 * @property {string} cashAC
 * @property {string} extra
 * @property {string} TDS
 * @property {string} tire
 * @property {string} spareParts
 * @property {string} truckNo
 * @property {string} lrdate
 * @property {string} logo
 * @property {string} signature
 * @property {string} [driverName]
 */
