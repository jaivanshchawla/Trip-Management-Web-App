export const fetchDriverName = async (driver: string) => {
    try {
        const response = await fetch(`/api/drivers/${driver}/name`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return 'NA'
        }

        const result = await response.json();
        return result.name
    } catch (err: any) {
        return {error : err}
    }
};

export const deleteDriverAccount = async (driverId: string, accountId: string) => {
    try {
        const response = await fetch(`/api/drivers/${driverId}/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
        return error
    }

}

export const EditDriverAccount = async (driverId : string, account : any, id : string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/accounts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            gave : account.gave,
            got : account.got,
          reason : account.reason,
          date : account.date,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver');
      }

      const data = await response.json();
      return data.driver.accounts.filter((acc : any)=>acc.account_id == id)[0]

    } catch (error: any) {
      console.error('Failed to update driver:', error);
      return error
    }
  };