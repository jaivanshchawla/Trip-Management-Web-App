export const DeleteAccount = async (accountId: string, tripId: string, partyId : string) => {
  try {
    const res = await fetch(`/api/parties/${partyId}/payments/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
    return data.payment
  } catch (error) {
    console.log(error)
    return error
  }

}

export const fetchTripRoute = async (tripId: string) => {
  if (tripId != '') {
    const tripRes = await fetch(`/api/trips/${tripId}`);
    const data = await tripRes.json();
    const trip = data.trip;
    return trip.route;
  }
}

export const handleEditAccount = async (editedItem: any, tripId: string, partyId : string) => {
  try {
    const res = await fetch(`/api/parties/${tripId}/payments/${editedItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedItem),
    });
    if (!res.ok) {
      throw new Error('Failed to edit item');
    }

    const resData = await res.json();
    if (resData.status == 400) {
      alert(resData.message);
      return;
    }
    return resData.payment
  } catch (error) {
    console.log(error);
    return { error: error }
  }
};


export async function extractEWayBillDetails(text: string) {
  const prompt = `
  This is extracted text from pdf extract these details from it i.e origin, destination, freight amount (total invoice amount), start date(the generation date of the document), truckNo, validity date. Give all this in JSON format

  Extracted Text:
  ${text}

  Response format :
  {
      startDate : '',
      origin : '',
      destination : '',
      validity : '',
      truckNo : '',
  }
`;

  // Send the prompt and extracted text to the Gemini API
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