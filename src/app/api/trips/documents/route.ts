import { NextResponse } from 'next/server';
import { connectToDatabase, tripSchema } from '@/utils/schema';
import { model, models } from 'mongoose';
import { verifyToken } from '@/utils/auth';

const Trip = models.Trip || model('Trip', tripSchema);



export async function GET(req: Request) {
  try {
    // Verify user token
    const { user, error } = await verifyToken(req);
    if (!user || error) {
      return NextResponse.json({ error: 'Unauthorized User', status: 401 });
    }

    // Extract 'type' from query parameters
    const url = new URL(req.url);
    const documentType = url.searchParams.get('type');
    await connectToDatabase();
    // Ensure 'type' is provided
    if (!documentType) {
      return NextResponse.json({error : 'No docType provided', status : 400})
    }

    // Connect to the database
    

    // Use aggregation to filter documents directly in MongoDB
    const trips = await Trip.aggregate([
      {
        $match: { user_id: user } // Match the user_id with the user
      },
      {
        $project: {
          user_id: 1,
          trip_id: 1,
          LR: 1,
          startDate: 1,
          route : 1,
          truck : 1,
          documents: {
            $filter: {
              input: '$documents',
              as: 'document',
              cond: { $eq: ['$$document.type', documentType] }
            }
          }
        }
      },
      {
        $match: { 'documents.0': { $exists: true } } // Only return drivers with matching documents
      }
    ]);

    // Format the result to combine driver info with each document
    const formattedDocs = trips.flatMap((trip: any) =>
      trip.documents.map((doc: any) => ({
        filename: doc.filename,
        type: doc.type,
        validityDate: doc.validityDate,
        uploadedDate: doc.uploadedDate,
        url: doc.url,
        user_id: trip.user_id,
        trip_id: trip.trip_id,
        route: trip.route,
        LR: trip.LR,
        truck : trip.truck,
        startDate : trip.startDate
      }))
    );

    // Return the formatted documents
    return NextResponse.json({ documents: formattedDocs, status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong', status: 500 });
  }
}

