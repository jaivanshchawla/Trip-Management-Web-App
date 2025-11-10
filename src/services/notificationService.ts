// services/notificationService.ts

import { messaging } from '@/firebase/firebaseAdmin';
import { connectToDatabase, fcmTokenSchema } from '@/utils/schema'; // Your Mongoose model
import { model, models } from 'mongoose';
const FcmToken = models.fcmToken || model('fcmToken', fcmTokenSchema);

interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string }; // Optional data payload
}

/**
 * Sends a push notification to all devices of a specific user.
 * @param userId - The ID of the user to send the notification to.
 * @param payload - The notification title, body, and optional data.
 */
export async function sendNotificationToUser(userId: string, payload: NotificationPayload) {
  await connectToDatabase();

  // 1. Find all FCM tokens for the given user
  const tokensDocs = await FcmToken.find({ user_id: userId });

  if (tokensDocs.length === 0) {
    console.log(`No FCM tokens found for user: ${userId}`);
    return;
  }

  const tokens = tokensDocs.map(doc => doc.fcm_token);

  // 2. Construct the multicast message
  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data, // Attach optional data
    tokens: tokens, // Array of tokens
  };

  console.log(`Sending notification to ${tokens.length} device(s) for user ${userId}`);

  try {
    // 3. Send the message to all tokens
    const batchResponse = await messaging.sendEachForMulticast(message);
console.log(batchResponse)
    // 4. Handle responses and clean up invalid tokens
    const tokensToDelete: string[] = [];
    batchResponse.responses.forEach((response, idx) => {
      const token = tokens[idx];
      if (!response.success) {
        console.error(`Failed to send to token: ${token}`, response.error);
        // Check for errors indicating an invalid or unregistered token
        if (
          response.error &&
          (response.error.code === 'messaging/invalid-registration-token' ||
            response.error.code === 'messaging/registration-token-not-registered')
        ) {
          tokensToDelete.push(token);
        }
      }
    });

    if (tokensToDelete.length > 0) {
      console.log(`Deleting ${tokensToDelete.length} stale tokens.`);
      await FcmToken.deleteMany({ fcm_token: { $in: tokensToDelete } });
    }

    console.log(`${batchResponse.successCount} messages were sent successfully.`);

  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}