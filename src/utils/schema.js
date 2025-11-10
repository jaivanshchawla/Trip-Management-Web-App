import mongoose from "mongoose";
import { Schema } from "mongoose";

const documentSchema = new Schema({
  filename: String,
  type: String,
  validityDate: Date,
  uploadedDate: Date,
  url: String
})

const truckDataSchema = new Schema({
  regNo: { type: String, default: null },
  chassis: { type: String, default: null },
  engine: { type: String, default: null },
  vehicleManufacturerName: { type: String, default: null },
  model: { type: String, default: null },
  vehicleColour: { type: String, default: null },
  type: { type: String, default: null },
  normsType: { type: String, default: null },
  bodyType: { type: String, default: null },
  ownerCount: { type: String, default: null },
  owner: { type: String, default: null },
  ownerFatherName: { type: String, default: null },
  mobileNumber: { type: String, default: null },
  status: { type: String, default: null },
  statusAsOn: { type: String, default: null },
  regAuthority: { type: String, default: null },
  regDate: { type: String, default: null },
  vehicleManufacturingMonthYear: { type: String, default: null },
  rcExpiryDate: { type: String, default: null },
  vehicleTaxUpto: { type: String, default: null },
  vehicleInsuranceCompanyName: { type: String, default: null },
  vehicleInsuranceUpto: { type: String, default: null },
  vehicleInsurancePolicyNumber: { type: String, default: null },
  rcFinancer: { type: String, default: null },
  presentAddress: { type: String, default: null },
  permanentAddress: { type: String, default: null },
  vehicleCubicCapacity: { type: String, default: null },
  grossVehicleWeight: { type: String, default: null },
  unladenWeight: { type: String, default: null },
  vehicleCategory: { type: String, default: null },
  rcStandardCap: { type: String, default: null },
  vehicleCylindersNo: { type: String, default: null },
  vehicleSeatCapacity: { type: String, default: null },
  vehicleSleeperCapacity: { type: String, default: null },
  vehicleStandingCapacity: { type: String, default: null },
  wheelbase: { type: String, default: null },
  vehicleNumber: { type: String, default: null },
  puccNumber: { type: String, default: null },
  puccUpto: { type: String, default: null },
  blacklistStatus: { type: String, default: null },
  blacklistDetails: { type: [String], default: [] },
  permitIssueDate: { type: String, default: null },
  permitNumber: { type: String, default: null },
  permitType: { type: String, default: null },
  permitValidFrom: { type: String, default: null },
  permitValidUpto: { type: String, default: null },
  nonUseStatus: { type: String, default: null },
  nonUseFrom: { type: String, default: null },
  nonUseTo: { type: String, default: null },
  nationalPermitNumber: { type: String, default: null },
  nationalPermitUpto: { type: String, default: null },
  nationalPermitIssuedBy: { type: String, default: null },
  isCommercial: { type: Boolean, default: false },
  nocDetails: { type: String, default: null },
  dbResult: { type: Boolean, default: null },
  partialData: { type: Boolean, default: null },
  mmvResponse: { type: String, default: null },
  financed: { type: String, default: null },
  class: { type: String, default: null },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt timestamps
})

export const partySchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  party_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
  },
  contactNumber: {
    required: true,
    type: String,
  },
  address: {
    type: String,
  },
  gstNumber: {
    type: String,
  },
  email : {
    type : String
  },
  pan : String,

});


export const PartyPaymentSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  party_id: {
    type: String,
    required: true
  },
  trip_id: {
    type: String,
  },
  accountType: {
    type: String,
    enum: ['Payments', 'Advances'],
    default: 'Payments'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['Cash', 'Cheque', 'Online Transfer', 'Bank Transfer', 'UPI', 'Fuel', 'Others'],
    required: true
  },
  driver_id: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
  }

})


export const PaymentBookSchema = {
  paymentBook_id: String,
  accountType: {
    type: String,
    enum: ['Payments', 'Advances']
  },
  amount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['Cash', 'Cheque', 'Online Transfer', 'Bank Transfer', 'UPI', 'Fuel', 'Others'],
    required: true
  },
  receivedByDriver: {
    type: Boolean,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
}





export const tripSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  trip_id: {
    type: String,
    required: true,
    unique: true
  },
  party: {
    type: String,
    required: true
  },
  truck: {
    type: String,
    required: true
  },
  driver: {
    type: String,
  },
  supplier: {
    type: String,
    default: ''
  },
  route: {
    origin: { type: String, required: true },
    destination: { type: String, required: true }
  },
  billingType: {
    type: String,
    enum: ['Fixed', 'Per Tonne', 'Per Kg', 'Per Trip', 'Per Day', 'Per Hour', 'Per Litre', 'Per Bag'],
    required: true
  },
  units: {
    type: Number,
  },
  rate: {
    type: Number
  },
  amount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now(),
    required: true
  },
  truckHireCost: {
    type: Number
  },
  LR: {
    type: String,
    required: true
  },
  fmNo: {
    type : String,
  },
  status: {
    type: Number,
    enum: [0, 1, 2, 3, 4]
  },
  POD: {
    type: String,
  },
  ewayBill: {
    type: String,
    default: ''
  },
  ewbValidityDate: {
    type: Date,
    default: null
  },
  dates: [
    Date
  ],
  guaranteedWeight : String,
  material : [
    {
      name : String,
      weight : String
    }
  ],
  notes: {
    type: String
  },
  invoice : {
    type : Boolean,
    default: false
  },
  invoice_id : String,
  accounts: [
    PaymentBookSchema,
  ],
  documents: [
    documentSchema
  ],
  loadingSlipDetails : {
    balance : Number || undefined,
    advance : Number || undefined,
    charges : Number || undefined,
    haltingCharges : Number || undefined,
    length : Number || undefined,
    width : Number || undefined,
    height : Number || undefined
  }
});



const driverAccountSchema = {
  account_id: String,
  date: Date,
  reason: String,
  gave: Number,
  got: Number,
}
export const driverSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  driver_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
  },
  licenseNo : String,
  aadharNo : String,
  lastJoiningDate : Date,
  status: {
    type: String,
    enum: ['Available', 'On Trip'],
    default: 'Active'
  },
  accounts: [{
    type: driverAccountSchema
  }],
  documents: [documentSchema]
});



export const truckSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  truck_id: { type: String, required: true, unique: true },
  truckNo: { type: String, required: true },
  truckType: { type: String },
  model: { type: String },
  capacity: { type: String },
  bodyLength: { type: String },
  ownership: { type: String, enum: ['Market', 'Self'] },
  supplier: { type: String },
  status: { type: String, enum: ['Available', 'On Trip'] },
  trip_id: { type: String, default: '' },
  driver_id: { type: String, default: '' },
  documents: [documentSchema],
  data : {type : truckDataSchema, default : {}},
  updatedAt: { type: Date, default: Date.now }
});
export const supplierSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  supplier_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String
  },
  balance: {
    type: Number,
    default: 0
  }
})

export const userSchema = new Schema({
  user_id: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  altPhone : String,
  name: { type: String },
  role: {
    name: String,
    user: String
  },
  gstNumber: String,
  address: String,
  company: String,
  city: String,
  pincode: String,
  panNumber: String,
  email: String,
  bankDetails: {
    msmeNo: String,
    accountNo: String,
    ifscCode: String,
    bankName: String,
    bankBranch: String,
  },
  logoUrl: String,
  stampUrl: String,
  signatureUrl: String,
  deviceType : {type : String, default : ''},
  documents: [{
    filename: String,
    url: String,
    uploadedDate: String
  }],
  lastLogin : {type : Date, default : Date.now()},
  createdAt: { type: Date, default: Date.now }
});



export const tripChargesSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  trip_id: {
    type: String,
    required: true
  },
  partyBill: {
    type: Boolean,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  expenseType: {
    type: String,
    required: true
  },
  notes: {
    type: String,
  }
})

export const
  ExpenseSchema = new Schema({
    user_id: {
      type: String,
      required: true
    },
    trip_id: {
      type: String
    },
    truck: {
      type: String,
      default: ''
    },
    expenseType: {
      type: String,
      required: true
    },
    paymentMode: {
      type: String,
      required: true
    },
    transaction_id: String,
    driver: String,
    amount: {
      type: Number,
      required: true
    },
    shop_id: String,
    date: {
      type: Date,
      required: true
    },
    notes: String,
    url: String
  })

export const draftExpenseSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  trip_id: {
    type: String
  },
  truck: {
    type: String,
    default: ''
  },
  expenseType: {
    type: String
  },
  paymentMode: {
    type: String,
  },
  transaction_id: String,
  driver: String,
  amount: {
    type: Number,
  },
  shop_id: String,
  date: {
    type: Date,
    default: () => new Date(Date.now()),

  },
  notes: String,
  url: String
})

export const fcmTokenSchema = new Schema({
user_id:{
  type: String,
      required: true

},
fcm_token:{
  type: String,
  required: true

}

})

export const supplierAccountSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  trip_id: {
    type: String,
  },
  supplier_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    default: 'Cash'
  },
  date: {
    type: Date,
    required: true
  },
  notes: String,
  refNo: String
})

export const OfficeExpenseSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  expenseType: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMode: String,
  shop_id: String,
  date: {
    type: Date,
    required: true
  },
  transactionId: String,
  notes: String
})

export const TokenBlacklistSchema = new Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export const ShopKhataSchema = new Schema({
  user_id: { type: String, required: true },
  shop_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  contactNumber: String,
  address: String,
  gstNumber: String,

})

export const ShopKhataAccountsSchema = new Schema({
  user_id: { type: String, required: true },
  shop_id: {
    type: String,
    required: true
  },
  reason: String,
  payment: Number,
  credit: Number,
  date: { type: Date, required: true }
})

export const RecentActivitiesSchema = new Schema({
  user_id: { type: String, required: true },
  activities: []
})

export const otherDocumentsSchema = new Schema({
  user_id: { type: String, required: true },
  filename: String,
  url: String,
  uploadedDate: Date,
  validityDate: Date
})

export const userExpenseTypesSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  expenseTypes: {
    type: [String],
    default: []
  }
})

export const InvoiceSchema = new Schema({
  user_id : {
    type : String,
    required : true
  },
  invoiceNo : {
    type : Number,
    required : true,
  },
  gst : Number,
  route : {
    origin : String,
    destination : String
  },
  date : {type : Date, required : true},
  dueDate : {type : Date, required : true},
  balance : {type : Number, required : true},
  total : {type : Number, required : true},
  party_id : {type : String, required : true},
  advance : {type : Number, required : true},
  trips : {type : [String]},
  invoiceStatus : {type : String, required : true, enum : ['Paid', 'Due'], default : 'Due'},
})

export const DeletedAccountSchema = new Schema({
  user_id : {
    type : String,
    required : true
  },
  phone : { type : String, required : true},
  reason : String
})


const connectString = process.env.NEXT_PUBLIC_MONGO_URL

export async function connectToDatabase() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(connectString);
  }
}

export const statuses = ['Started', 'Completed', 'POD Recieved', 'POD Submitted', 'Settled'];
