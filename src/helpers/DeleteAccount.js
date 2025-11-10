export const handleDeleteItem = async (tripId, item) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/accounts/${item._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { account: item, delete: true } }),
      });
      if (!res.ok) {
        throw new Error('Failed to delete item');
      }
      const resData = await res.json();
      return resData.trip.accounts;
    } catch (error) {
      console.log(error);
    }
  };
