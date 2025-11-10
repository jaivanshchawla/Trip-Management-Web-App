import { recentActivity } from "@/helpers/recentActivity";
import { verifyToken } from "@/utils/auth";
import { connectToDatabase, driverSchema, otherDocumentsSchema, tripSchema, truckSchema } from "@/utils/schema";
import { models, model } from "mongoose";
import { NextResponse } from "next/server";

const OtherDocuments = models.OtherDocuments || model("OtherDocuments", otherDocumentsSchema);

export async function PATCH(req: Request, { params }: { params: { documentId: string } }) {
    try {
        const { user, error } = await verifyToken(req);
        if (!user || error) {
            return NextResponse.json({ error: "Unauthorized user", status: 401 });
        }

        const { documentId } = params;
        await connectToDatabase();
        const data = await req.json();

        const document = await OtherDocuments.findByIdAndDelete(documentId);
        if (!document) {
            return NextResponse.json({ error: "Document not found", status: 404 });
        }

        const url = new URL(req.url);
        const movingto = url.searchParams.get("movingto");
        const commonDocFields = {
            filename: data.filename || "",
            type: data.docType,
            validityDate: new Date(data.validityDate),
            uploadedDate: new Date(),
            url: document.url,
        };

        switch (movingto) {
            case "trip": {
                const Trip = models.Trip || model("Trip", tripSchema);
                const { tripId } = data;
                if (!tripId) {
                    return NextResponse.json({ error: "Missing tripId", status: 400 });
                }

                const trip = await Trip.findOne({ user_id: user, trip_id: tripId });
                if (!trip) {
                    return NextResponse.json({ error: "Trip not found", status: 404 });
                }

                const existingDocIndex = trip.documents.findIndex((doc: any) => doc.type === data.docType);
                if (existingDocIndex !== -1) {
                    trip.documents[existingDocIndex] = commonDocFields;
                } else {
                    trip.documents.unshift(commonDocFields);
                }

                await Promise.all([trip.save(), recentActivity('Moved to Trip Document', trip, user)]);
                return NextResponse.json({ status: 200 });
            }

            case "truck": {
                const Truck = models.Truck || model("Truck", truckSchema);
                const { truckNo } = data;
                if (!truckNo) {
                    return NextResponse.json({ error: "Missing truckNo", status: 400 });
                }

                const truck = await Truck.findOne({ user_id: user, truckNo });
                if (!truck) {
                    return NextResponse.json({ error: "Truck not found", status: 404 });
                }

                const existingDocIndex = truck.documents.findIndex((doc: any) => doc.type === data.docType);
                if (existingDocIndex !== -1) {
                    truck.documents[existingDocIndex] = commonDocFields;
                } else {
                    truck.documents.unshift(commonDocFields);
                }

                await Promise.all([truck.save(), recentActivity('Moved to Lorry Document', truck, user)]);
                return NextResponse.json({ status: 200 });
            }

            case "driver": {
                const Driver = models.Driver || model("Driver", driverSchema);
                const { driverId } = data;
                if (!driverId) {
                    return NextResponse.json({ error: "Missing driverId", status: 400 });
                }

                const driver = await Driver.findOne({ user_id: user, driver_id: driverId });
                if (!driver) {
                    return NextResponse.json({ error: "Driver not found", status: 404 });
                }

                const existingDocIndex = driver.documents.findIndex((doc: any) => doc.type === data.docType);
                if (existingDocIndex !== -1) {
                    driver.documents[existingDocIndex] = commonDocFields;
                } else {
                    driver.documents.unshift(commonDocFields);
                }

                await Promise.all([driver.save(), recentActivity('Moved to Driver Document', driver, user)]);
                return NextResponse.json({ status: 200 });
            }

            case "company":
                return NextResponse.json({ error: "Company handling not implemented", status: 501 });

            default:
                return NextResponse.json({ error: "Invalid movingto value", status: 400 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error", status: 500 });
    }
}
