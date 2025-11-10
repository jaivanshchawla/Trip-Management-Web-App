import { verifyToken } from "@/utils/auth";
import { PartyPaymentSchema, tripChargesSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const TripCharges = models.TripCharges || model("TripCharges", tripChargesSchema);
const PartyPayments = models.PartyPayments || model("PartyPayments", PartyPaymentSchema);

export async function POST(req: Request) {
  try {
    const { user, error } = await verifyToken(req);
    if (!user || error) {
      return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    const data = await req.json();
    console.log(data)
    const {
      editedPayments,
      editedCharges,
      deletedChargeIds,
      deletedPaymentIds,
      newPayments,
      newCharges,
    } = data;

    const bulkOperations: Promise<any>[] = [];

    // Handle Edited Payments
    if (editedPayments && editedPayments.length > 0) {
      const paymentUpdates = editedPayments.map((payment: any) => ({
        updateOne: {
          filter: { _id: payment.id },
          update: { $set: payment },
        },
      }));
      bulkOperations.push(PartyPayments.bulkWrite(paymentUpdates));
    }

    // Handle Edited Charges
    if (editedCharges && editedCharges.length > 0) {
      const chargeUpdates = editedCharges.map((charge: any) => ({
        updateOne: {
          filter: { _id: charge._id },
          update: { $set: charge },
        },
      }));
      bulkOperations.push(TripCharges.bulkWrite(chargeUpdates));
    }

    // Handle Deleted Payments
    if (deletedPaymentIds && deletedPaymentIds.length > 0) {
      bulkOperations.push(PartyPayments.deleteMany({ _id: { $in: deletedPaymentIds } }));
    }

    // Handle Deleted Charges
    if (deletedChargeIds && deletedChargeIds.length > 0) {
      bulkOperations.push(TripCharges.deleteMany({ _id: { $in: deletedChargeIds } }));
    }

    // Handle New Payments
    if (newPayments && newPayments.length > 0) {
      const payments = newPayments.map((payment : any)=>({
        user_id : user,
        ...payment
      }))
      bulkOperations.push(PartyPayments.insertMany(payments));
    }

    // Handle New Charges
    if (newCharges && newCharges.length > 0) {
      const charges = newCharges.map((charge : any)=>({
        user_id : user,
        ...charge
      }))
      bulkOperations.push(TripCharges.insertMany(charges));
    }

    // Execute All Bulk Operations
    const results = await Promise.all(bulkOperations);

    return NextResponse.json(
      { message: "Operations successful", results },
      { status: 200 }
    );
  } catch (error : any) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
