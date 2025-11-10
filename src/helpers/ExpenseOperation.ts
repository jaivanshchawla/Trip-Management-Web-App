
import { IExpense } from "@/utils/interface";


export const handleAddExpense = async (expense: IExpense, file?: File | null, toast? : any) => {
  try {
    const formdata = new FormData()
    formdata.append('expense', JSON.stringify(expense))
    if (file) formdata.append('file', file)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      body: formdata
    })
    if (!res.ok) {
      toast && toast({
        description: `error adding expense`,
        variant: 'destructive'
    });
    }
    const data = await res.json()
    toast({
      description : "Expense added successfully"
    })
    return data.expense
  } catch (error: any) {
    toast && toast({
      description: `Failed to add expense`,
      variant: 'destructive'
  });
  }
}

export const handleEditExpense = async (expense: IExpense, id: string, file?: File | null, toast? : any) => {
  try {
    const formdata = new FormData()
    formdata.append('expense', JSON.stringify(expense))
    if (file) formdata.append('file', file)
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      body: formdata
    })
    if (!res.ok) {
      throw new Error("Failed to add Expense")
    }
    const data = await res.json()
    // toast({
    //   description : "Expense edited successfully"
    // })
    return data.expense
  } catch (error: any) {
    return error
  }
}

export const DeleteExpense = async (id: string) => {
  try {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      alert('Failed to delete expense');
      return;
    }
    const data = await res.json()
    return data.expense
  } catch (error: any) {
    alert(error.message)
    console.log(error)
  }
}

export const handleDelete = async (id: string, e?: React.MouseEvent) => {
  e?.stopPropagation(); // Prevent the row's click event from being triggered
  const res = await fetch(`/api/expenses/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    alert('Failed to delete expense');
    return;
  }
  const data = await res.json()
  return data
};

export const handleAddCharge = async (newCharge: any, id?: string, truckNo?: string) => {
  const truckExpenseData = {
    ...newCharge,
    truck: truckNo,
    transaction_id: newCharge.transactionId || '',
    driver: newCharge.paymentMode == 'Paid By Driver' ? newCharge.driver : '',
    notes: newCharge.notes || '',
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/expenses/${id}` : `/api/trucks/${truckNo}/expense`;

  const res = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(truckExpenseData),
  });

  if (!res.ok) {
    alert('Failed to add charge');
    return;
  }

  const data = await res.json();
  return data
};

export const ExpenseforDriver = async (driver: string) => {
  try {
    const res = await fetch(`/api/drivers/${driver}/expense`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    const data = await res.json()
    return data.driverExpenses
  } catch (err) {
    alert(err)
    console.log(err)
  }

}

export const fetchTruckExpense = async (month: any, year: any) => {
  try {
    let res
    if (month === null || year === null) {
      res = await fetch(`/api/expenses/truckExpense`)
    } else {
      res = await fetch(`/api/expenses/truckExpense?month=${month}&year=${year}`);
    }

    if (!res.ok) {
      throw new Error('Failed to fetch truck expenses');
    }
    const data = await res.json();
    return data.truckExpense;
  } catch (error) {
    console.error('Error fetching truck expenses:', error);
    return [];
  }
};

export const fetchTripExpense = async () => {
  try {
    const res = await fetch(`/api/expenses/tripExpense`)
    if (!res.ok) {
      throw new Error('Failed to fetch truck expenses');
    }
    const data = await res.json();
    return data.tripExpense;
  } catch (error) {
    console.error('Error fetching trip expenses:', error);
    return [];
  }
};




