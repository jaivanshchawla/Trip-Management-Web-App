export const fetchPartyName = async (party : string) => {
    try {
      const partyRes = await fetch(`/api/parties/${party}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!partyRes.ok) {
        return ''
      }
      const partyData = await partyRes.json();
      return partyData.party.name
    } catch (error) {
      console.log('Error fetching party name:', error);
      return ''
    }
  };