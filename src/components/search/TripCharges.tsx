import React from 'react'

interface props {
    charges: any[]
}

const TripCharges: React.FC<props> = ({ charges }) => {
    return (
        <div className='flex flex-col space-y-4 w-full'>
            <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Trip Charges</h1>
            <div className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
                {charges.map((charge: any, index: number) => (
                    <div
                        key={index}
                        className="flex flex-col px-4 py-4 w-1/2 bg-lightOrangeButtonColor transition duration-300 ease-out transform hover:scale-105 rounded-lg cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Amount: ₹{charge.amount}</p>
                                <p className="text-xs text-gray-600">Type: {charge.expenseType}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-600">Date: {new Date(charge.date).toLocaleDateString()}</p>
                                <p className={`text-xs font-semibold ${charge.partyBill ? 'text-green-600' : 'text-red-600'}`}>
                                    {charge.partyBill ? 'Added to Bill' : 'Reduced from Bill'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 bg-gray-100 p-4 rounded-md border border-gray-300">
                            {charge.notes && (
                                <p className="text-xs text-gray-600 mb-2">Notes: {charge.notes}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TripCharges
