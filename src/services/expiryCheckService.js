// services/expiryCheckService.js

import { models, model } from 'mongoose';
import { connectToDatabase, driverSchema, tripSchema, truckSchema } from "@/utils/schema";
import { sendNotificationToUser } from '@/services/notificationService'; // Your existing service

/**
* Finds all documents from a specific collection that are expiring on a specific day in the future.
* This is an internal helper function for this service.
* @param {string} modelName - The name of the Mongoose model.
* @param {any} schema - The Mongoose schema for the model.
* @param {Object} projectionFields - The fields to include from the parent document.
* @param {string} entityType - A string identifier for the entity type (e.g., "Truck").
* @param {number} daysUntilExpiry - The number of days from now that the document is expiring.
*/
// services/expiryCheckService.js

// services/expiryCheckService.js

async function findExpiringDocuments(
  modelName,
  schema,
  projectionFields,
  entityType,
  daysUntilExpiry
) {
  const Model = models[modelName] || model(modelName, schema);

  // --- START OF IST-SPECIFIC FIX ---

  // 1. Define the IST offset in milliseconds (5 hours and 30 minutes)
  const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

  // 2. Get the current date and calculate the target date based on UTC
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setUTCDate(now.getUTCDate() + daysUntilExpiry);

  // 3. Calculate the start and end of the target day in PURE UTC
  const utcTargetStart = new Date(Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
    0, 0, 0, 0
  ));

  const utcTargetEnd = new Date(Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
    23, 59, 59, 999
  ));

  // 4. Adjust the UTC start and end times to match IST's day boundaries
  // An IST day starts at 18:30Z on the previous day. So we subtract the offset.
  const istTargetDateStart = new Date(utcTargetStart.getTime() - IST_OFFSET_MS);
  const istTargetDateEnd = new Date(utcTargetEnd.getTime() - IST_OFFSET_MS);

  // --- END OF IST-SPECIFIC FIX ---


  console.log(`[${entityType}] Checking for expiry on ${targetDate.toDateString()} (${daysUntilExpiry} days from now)`);
  // Use the adjusted IST boundaries for the query and logs
  console.log(`[${entityType}] Date range: ${istTargetDateStart.toISOString()} to ${istTargetDateEnd.toISOString()}`);

  return Model.aggregate([
    // The rest of your aggregation pipeline remains the same
    {
      $match: {
        "documents": {
          $elemMatch: {
            // Query with the correct IST-based date range
            "validityDate": { $gte: istTargetDateStart, $lte: istTargetDateEnd }
          }
        }
      }
    },
    { $unwind: "$documents" },
    {
      $match: {
        "documents.validityDate": { $gte: istTargetDateStart, $lte: istTargetDateEnd },
      }
    },
    {
      $project: {
        ...projectionFields,
        user_id: 1,
        documentName: "$documents.filename",
        validityDate: "$documents.validityDate",
        entityType: { $literal: entityType },
        daysUntilExpiry: { $literal: daysUntilExpiry }
      }
    }
  ]);
}

/**
* Creates a user-friendly time phrase based on the number of days
* @param {number} days - The number of days until expiry.
* @returns {string}
*/
function getTimePhrase(days) {
  switch (days) {
    case 1:
      return "tomorrow";
    case 3:
      return "in 3 days";
    case 7:
      return "in 1 week";
    case 30:
      return "in 1 month";
    default:
      return `in ${days} days`;
  }
}

/**
* This is the main function the cron job will trigger.
* It orchestrates fetching documents for multiple expiry intervals and sending notifications.
*/
export async function handleDailyExpiryCheck() {
  console.log("Starting daily expiry check for multiple intervals...");
  await connectToDatabase();

  const checkIntervals = [1, 3, 7, 30]; // Check for 1 day, 3 days, 1 week, and 1 months
  const allPromises = [];

  // 1. Create a list of all promises for all entities and all intervals
  for (const days of checkIntervals) {
    console.log(`Queueing checks for documents expiring in ${days} day(s)...`);
    allPromises.push(findExpiringDocuments("Trip", tripSchema, { LR: 1 }, "Trip", days));
    allPromises.push(findExpiringDocuments("Truck", truckSchema, { truckNo: 1 }, "Truck", days));
    allPromises.push(findExpiringDocuments("Driver", driverSchema, { name: 1 }, "Driver", days));
  }

  // Execute all queries in parallel and flatten the results
  const allRemindersNested = await Promise.all(allPromises);
  const allReminders = allRemindersNested.flat();

  console.log(`Found ${allReminders.length} total reminders across all intervals`);

  if (allReminders.length === 0) {
    const message = "No documents found for any expiry interval. Job finished.";
    console.log(message);
    return { success: true, message };
  }

  // 2. Send individual notifications for each reminder (better UX)
  const data = { screen: "reminders" };
  let successCount = 0;
  let failureCount = 0;
  const userNotificationCounts = new Map();

  for (const reminder of allReminders) {
    const userId = reminder.user_id.toString();
    const timePhrase = getTimePhrase(reminder.daysUntilExpiry);

    // Create a specific title and body for each reminder
    let title = 'Document Expiry Reminder';
    let bodyMessage = `📄 Your document`;

    if (reminder.entityType === 'Truck') {
      title = 'Truck Document Expiry';
      bodyMessage += ` for Truck '${reminder.truckNo}'`;
    } else if (reminder.entityType === 'Driver') {
      title = 'Driver Document Expiry';
      bodyMessage += ` for Driver '${reminder.name}'`;
    } else if (reminder.entityType === 'Trip') {
      title = 'Trip Document Expiry';
      bodyMessage += ` for Trip LR '${reminder.LR}'`;
    }

    bodyMessage += ` expires ${timePhrase}.`;

    try {
      await sendNotificationToUser(userId, {
        title: title,
        body: bodyMessage,
        data: data
      });
      
      successCount++;
      userNotificationCounts.set(userId, (userNotificationCounts.get(userId) || 0) + 1);
      
      console.log(`✅ Notification sent to user ${userId}: ${title}`);
    } catch (error) {
      failureCount++;
      console.error(`❌ Failed to send notification to user ${userId}:`, error);
    }
  }

  const uniqueUsers = userNotificationCounts.size;
  const finalMessage = `Sent ${successCount} individual notifications to ${uniqueUsers} users across ${checkIntervals.length} intervals. ${failureCount} failures.`;
  console.log(finalMessage);
  return { success: true, message: finalMessage };
}
