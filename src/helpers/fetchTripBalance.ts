import { ITrip, TripExpense } from "@/utils/interface";


  export const fetchBalanceBack = async(trip : ITrip, charges : TripExpense[])=>{
    const accountBalance = trip.accounts.reduce((total, account) => total + account.amount, 0);
      let chargeToBill = 0
      let chargeNotToBill = 0
      if (charges){
        chargeToBill = charges.filter(charge => charge.partyBill).reduce((total, charge) => total + charge.amount, 0);
        chargeNotToBill = charges.filter(charge =>!charge.partyBill).reduce((total, charge) => total + charge.amount, 0);
      }
      const pending = trip.amount - accountBalance - chargeNotToBill + chargeToBill
      return pending
}