import { verifyToken } from "@/utils/auth";
import { connectToDatabase, ExpenseSchema, OfficeExpenseSchema, ShopKhataAccountsSchema } from "@/utils/schema";
import { model, models } from "mongoose";
import { NextResponse } from "next/server";

const Expense = models.Expense || model('Expense', ExpenseSchema)
const ShopKhataAccounts = models.ShopKhataAccounts || model('ShopKhataAccount', ShopKhataAccountsSchema)
const OfficeExpense = models.OfficeExpense || model('OfficeExpense', OfficeExpenseSchema)

export async function GET(req: Request, { params }: { params: { shopId: string } }) {
    try {
      // Verify the user token
      const { user, error } = await verifyToken(req);
      if (!user || error) {
        return NextResponse.json({ error: 'Unauthorized User', status: 401 });
      }
  
      const { shopId } = params;
  
      // Connect to the database
      await connectToDatabase();
  
      // Use aggregation to calculate total credit and payment from ShopKhataAccounts
      const [khataTotals] = await ShopKhataAccounts.aggregate([
        { $match: { user_id: user, shop_id: shopId } },
        {
          $group: {
            _id: null,
            totalCredit: { $sum: '$credit' },
            totalPayment: { $sum: '$payment' },
          },
        },
      ]);
  
      // Use aggregation to calculate total expense from Expense and OfficeExpense
      const [expenseTotal] = await Expense.aggregate([
        { $match: { user_id: user, shop_id: shopId } },
        { $group: { _id: null, totalExpense: { $sum: '$amount' } } },
      ]);
  
      const [officeExpenseTotal] = await OfficeExpense.aggregate([
        { $match: { user_id: user, shop_id: shopId } },
        { $group: { _id: null, totalOfficeExpense: { $sum: '$amount' } } },
      ]);
  
      // Calculate the total balance
      const totalCredit = khataTotals?.totalCredit || 0;
      const totalPayment = khataTotals?.totalPayment || 0;
      const totalExpenses = (expenseTotal?.totalExpense || 0) + (officeExpenseTotal?.totalOfficeExpense || 0);
  
      // Shop balance calculation
      const balance =   totalPayment - totalExpenses -totalCredit;
  
      return NextResponse.json({ balance, totalCredit, totalPayment, totalExpenses, status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error, status: 500 });
    }
  }
  