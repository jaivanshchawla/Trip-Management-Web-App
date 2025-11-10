// interfaces/Driver.ts

import { Document } from 'mongoose';


export interface InvoiceFormData {
  color? : string;
  rate: string;
  billingtype: string;
  logoUrl: string;
  billNo: string;
  partygst :  string
  partyAddress : string;
  date: string;
  to: string;
  from: string;
  branch: string;
  address: string;
  particulars: string;
  party: string;
  companyName: string;
  phone: string
  altPhone? : string;
  email: string;
  signatureUrl : string;
  stampUrl : string
  dueDate : string
  gstType?: "IGST" | "SGST + CGST" | "";
  gst? : number | undefined,
  freightCharges: {
    lrNo: string;
    truckNo: string;
    material: string[];
    date : string
    weight: string;
    charged: string;
    rate: string;
    amount: number;
  }[] | [];
  additionalCharges: {
    id : string
    date : string
    truckNo: string;
    expenseType: string;
    notes: string;
    amount: number;
    edited : boolean
  }[] | [];
  extraAdditionalCharges: {
    id : string
    date : string
    partyBill : boolean
    truckNo: string;
    expenseType: string;
    notes: string;
    amount: number;
    trip_id : string;
  }[] | [];
  partyDetails: {
    msmeNo: string;
    gstin: string;
    pan: string;
    accNo: string;
    ifscCode: string;
    bankName: string;
    bankBranch: string;
  };
  paymentDetails: {
    id: string
    date: string;
    paymentType: string;
    notes: string;
    amount: number;
    edited: boolean
  }[] | [];
  extraPaymentDetails: {
    id: string
    date: string;
    party_id : string;
    paymentType: string;
    accountType : string;
    notes: string;
    amount: number;
    driver_id? : string;

  }[] | [];
}

// Define the interface for the driver account schema
export interface IDriverAccount {
  account_id: string
  date: Date;
  reason: string;
  gave: number;
  got: number;
}

export interface invData extends Document{
  user_id : string
  invoiceNo : number
  advance : number
  party_id : string
  date : Date
  dueDate : Date
  route : {
    origin : string,
    destination : string
  },
  balance : number
  invoiceStatus : string
  total : number
  trips : [string]
}


// Define the interface for the driver schema
export interface IDriver extends Document {
  driver_id: string;
  name: string;
  contactNumber: string;
  licenseNo : string;
  aadharNo : string;
  lastJoiningDate : Date
  status: 'Available' | 'On Trip';
  balance?: number;
  accounts: IDriverAccount[];
}
// interfaces/Trip.ts

export interface PaymentBook extends Document{
  _id: string;
  paymentBook_id: string
  accountType: string
  amount: number;
  paymentType: 'Cash' | 'Cheque' | 'Online Transfer';
  receivedByDriver: boolean;
  date: Date;
  notes?: string;
  driver_id? : string
}

interface Route {
  origin: string;
  destination: string;
}

export interface TripExpense extends Document{
  trip_id: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string;
}

export interface ITrip extends Document {
  trip_id: string;
  advance?: number;
  party: string;
  truck: string;
  driver: string;
  supplier : string
  route: Route;
  billingType: 'Fixed' | 'Per Tonne' | 'Per Kg' | 'Per Trip' | 'Per Day' | 'Per Hour' | 'Per Litre' | 'Per Bag';
  amount: number;
  startDate: Date;
  truckHireCost: number;
  LR: string;
  fmNo? : string
  status?: 0 | 1 | 2 | 3 | 4;
  POD?: string;
  dates: Date[];
  notes?: string;
  accounts : PaymentBook[]
  tripAccounts?: PaymentBook[]; // Add this line
  advanceTotal?: number; // optional for new field
  ewayBill : string
  ewbValidityDate : Date
  documents : [{
    filename : string,
    type : string,
    validityDate : Date,
    uploadedDate : Date,
    url : string
  }]
  partyName : string;
  invoice : boolean
  balance : number
  units? : number;
  rate?: number;
  invoice_id? : string
  material? : { name: string; weight: string }[]
  guaranteedWeight? : string;
  loadingSlipDetails?: {
    balance?: number;
    advance?: number;
    charges?: number;
    haltingCharges?: number;
    length?: number;
    width?: number;
    height?: number;
  };
}

export interface Idoc{
  filename : string,
  type : string,
  validityDate : Date,
  uploadedDate : Date,
  url : string

}


// interfaces/Party.ts


export interface IParty extends Document {
  user_id : string
  party_id: string;
  name: string;
  contactPerson: string;
  contactNumber: string;
  address: string;
  gstNumber: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  email : string;
  pan : string;
  partyBalance : number
}


// interfaces/Truck.ts

export interface TruckModel extends Document {
  truckNo: string;
  truck_id : string
  truckType: string;
  model: any;
  capacity: string;
  bodyLength: string | null;
  ownership: string;
  supplier: string;
  status: 'Available' | 'On Trip'
  trip_id : string
  documents : []
  createdAt: Date;
  updatedAt: Date;
  driver_id : string
}

export interface ISupplier extends Document{
  supplier_id: string;
  name: string;
  contactNumber: string
  balance : number
}

export interface IExpense extends Document{
  user_id: string;
  trip_id: string;
  truck: string;
  expenseType: string;
  paymentMode: string;
  transaction_id?: string; // Optional
  driver?: string;         // Optional
  amount: number;
  date: Date;
  notes?: string;          // Optional
}

export interface ITripCharges extends Document{
  user_id: string;
  trip_id: string;
  partyBill: boolean;
  amount: number;
  date: Date;
  expenseType: string;
  notes?: string; // Optional field
}

export interface ISupplierAccount extends Document{
  user_id : string
  supplier_id: string;
  trip_id : string
  amount: number;
  paymentMode : string
  date : string
  notes : string
  refNo : string
}

export type ConsignerConsigneeType = {
  gstNumber: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber: string;
};

export type EWBFormDataType = {
  gstNumber: string
  pan: string
  companyName: string
  address: string
  city: string
  pincode: string
  from : string,
  to : string;
  contactNumber: string
  altPhone? : string
  email: string
  date: Date
  LR: string
  consigner: ConsignerConsigneeType
  consignee: ConsignerConsigneeType
  materials: {name : string, weight : string}[]
  weight: string
  unit: string
  paidBy: 'consigner' | 'consignee' | 'agent'
  ewayBillNo: string
  invoiceNo: string
  truckNo: string
  logo: string
  signature: string
  value : string | number
  grtdWeight : string | number
}

export interface FMDataType {
  gstNumber: string;
  rate: string;
  pan: string;
  companyName: string;
  ownerName?: string;
  supplierName?: string;
  userName?: string; 
  address: string;
  city: string;
  pincode: string;
  altPhone? : string;
  contactNumber: string;
  email: string;
  date: Date;
  challanNo: string
  from: string;
  to: string;
  totalFreight: string;
  commision: string;
  weight: string;
  material: {name : string, weight : string}[];
  unit: string;
  noOfBags: string;
  vehicleOwner: string;
  advance: string;
  hamali: string;
  extraWeight: string;
  billingtype: string;
  cashAC: string;
  extra: string;
  TDS: string;
  tire: string;
  spareParts: string;
  truckNo: string;
  lrdate: string
  logo: string;
  signature : string;
  driverName?: string;
}
