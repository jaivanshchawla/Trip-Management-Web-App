// pages/api/send-test-notification.ts

import { sendNotificationToUser } from '@/services/notificationService';
import {,  } from 'next';
import { NextResponse } from 'next/server';

export  async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' });
  }

    const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required' });
  }

  try {
    // Define the notification content
    const notificationPayload = {
      title: 'Hello from the Server!',
      body: `This is a test notification for user ${userId}.`,
      data,
    };

    // Call the service function
    await sendNotificationToUser(userId, notificationPayload);

   return NextResponse.json({ message: 'Notification sent successfully!' });
  } catch (error) {
    console.error('Failed to send notification:', error);
   return NextResponse.json({ message: 'Internal Server Error' });
  }
}
