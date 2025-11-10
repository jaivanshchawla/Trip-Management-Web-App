async function extractReciptDetails(text: string) {
    const prompt = `
    This is extracted text from pdf extract these details from it i.e amount, date, expenseType. Give all this in JSON format. Return Empty string for field if not found.

  
    Extracted Text:
    ${text}
  
    Response format :
    {
        amount : '',
        date : '',
        expenseType : '',
    }
  `;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "contents": [{
        "parts": [{
          "text": prompt
        }]
      }]
    })
  });
  const responseData = await res.json();
  let responseText = responseData.candidates[0].content.parts[0].text;

  // Remove extraneous characters (e.g., triple backticks, other non-JSON text)
  // console.log(responseText.split('```')[1].split('json')[1])
  // responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

  // Parse the cleaned string into a JSON object
  const jsonObject = JSON.parse(responseText.split('```')[1].split('json')[1]);
  return jsonObject
}

import { verifyToken } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req:Request) {
    try {
        const {user, error} = await verifyToken(req)
        if(!user || error){
            return NextResponse.json({error : 'Unauthorized User', status : 401})
        }
        const text = await req.text()
        const reciptDetails = await extractReciptDetails(text)
        return NextResponse.json({success : true, reciptDetails, status : 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error : 'Internal Server Error', status : 500})
    }
}