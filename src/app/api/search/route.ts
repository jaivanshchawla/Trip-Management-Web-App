import { verifyToken } from "@/utils/auth";
import {
    connectToDatabase,
    driverSchema,
    ExpenseSchema,
    OfficeExpenseSchema,
    partySchema,
    supplierAccountSchema,
    supplierSchema,
    tripChargesSchema,
    tripSchema,
    truckSchema,
} from "@/utils/schema";
import { models, model } from "mongoose";
import { NextResponse } from "next/server";

const Party = models.Party || model("Party", partySchema);
const Trip = models.Trip || model("Trip", tripSchema);
const Driver = models.Driver || model("Driver", driverSchema);
const Truck = models.Truck || model("Truck", truckSchema);
const Supplier = models.Supplier || model("Supplier", supplierSchema);
const Expense = models.Expense || model("Expense", ExpenseSchema);
const SupplierAccount = models.SupplierAccount || model("SupplierAccount", supplierAccountSchema);
const OfficeExpense = models.OfficeExpense || model("OfficeExpense", OfficeExpenseSchema);
const TripCharges = models.TripCharges || model("TripCharges", tripChargesSchema);

export async function GET(req: Request) {
    try {
        // Verify the user's token
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: error || "Unauthorized access" }, { status: 401 });
        }

        // Parse the query parameter from the request
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";

        // Connect to the database
        await connectToDatabase();

        const numericQuery = parseFloat(query);
        const isNumericQuery = !isNaN(numericQuery);

        // Define the search criteria for each collection
        const searchCriteria = query
            ? {
                user_id: user,
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { party_id: { $regex: query, $options: "i" } },
                    { contactPerson: { $regex: query, $options: "i" } },
                    { contactNumber: { $regex: query, $options: "i" } },
                    { address: { $regex: query, $options: "i" } },
                    { gstNumber: { $regex: query, $options: "i" } },
                ],
            }
            : { user_id: user };

        // Fetch data from all collections
        const [parties, trips, drivers, trucks, suppliers, expenses, supplierAccounts, officeExpenses, tripCharges] =
            await Promise.all([
                Party.find(searchCriteria).lean(),
                Trip.find({
                    user_id: user,
                    $or: [
                        { billingType: { $regex: query, $options: "i" } },
                        { LR: { $regex: query, $options: "i" } },
                        { truck: { $regex: query, $options: "i" } },
                        { notes: { $regex: query, $options: "i" } },
                        ...(isNumericQuery ? [{ amount: numericQuery }, { "accounts.amount": numericQuery }] : []),
                        { "accounts.paymentType": { $regex: query, $options: "i" } },
                        { "accounts.notes": { $regex: query, $options: "i" } },
                        { "route.origin": { $regex: query, $options: "i" } },
                        { "route.destination": { $regex: query, $options: "i" } },
                    ],
                }).lean(),

                Driver.find({
                    user_id: user,
                    $or: [
                        { name: { $regex: query, $options: "i" } },
                        { licenseNumber: { $regex: query, $options: "i" } },
                        { contactNumber: { $regex: query, $options: "i" } },
                        { status: { $regex: query, $options: "i" } }
                    ],
                }).lean(),
                Truck.find({
                    user_id: user,
                    $or: [
                        { truckNo: { $regex: query, $options: "i" } },
                        { truckType: { $regex: query, $options: "i" } },
                        { model: { $regex: query, $options: "i" } },
                        { capacity: { $regex: query, $options: "i" } },
                        { bodyLength: { $regex: query, $options: "i" } },
                        { ownerShip: { $regex: query, $options: "i" } },
                    ],
                }).lean(),
                Supplier.find({
                    user_id: user,
                    $or: [
                        { name: { $regex: query, $options: "i" } },
                        { contactNumber: { $regex: query, $options: "i" } },
                    ],
                }).lean(),
                Expense.find({
                    user_id: user,
                    $or: [
                        ...(isNumericQuery ? [{ amount: numericQuery }] : []),
                        { expenseType: { $regex: query, $options: "i" } },
                        { paymentMode: { $regex: query, $options: "i" } },
                        { transaction_id: { $regex: query, $options: "i" } },
                        { notes: { $regex: query, $options: "i" } },
                    ],
                }).lean(),
                SupplierAccount.find({
                    user_id: user,
                    $or: [
                        { refNo: { $regex: query, $options: "i" } },
                        { paymentMode: { $regex: query, $options: "i" } },
                        ...(isNumericQuery ? [{ amount: numericQuery }] : []),
                        { notes: { $regex: query, $options: "i" } },
                    ],
                }).lean(),
                OfficeExpense.find({
                    user_id: user,
                    $or: [
                        ...(isNumericQuery ? [{ amount: numericQuery }] : []),
                        { expenseType: { $regex: query, $options: "i" } },
                        { paymentMode: { $regex: query, $options: "i" } },
                        { transactionId: { $regex: query, $options: "i" } },
                        { notes: { $regex: query, $options: "i" } },
                    ],
                }).lean(),
                TripCharges.find({
                    user_id: user,
                    $or: [
                        ...(isNumericQuery ? [{ amount: numericQuery }] : []),
                        { expenseType: { $regex: query, $options: "i" } },
                        { notes: { $regex: query, $options: "i" } },
                    ],
                }).lean(),
            ]);

        // Return the fetched data
        return NextResponse.json({
            parties,
            trips,
            drivers,
            trucks,
            suppliers,
            expenses,
            supplierAccounts,
            officeExpenses,
            tripCharges,
        });
    } catch (error: any) {
        // Handle any errors that occur during the process
        console.log(error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
