import { useEffect, useState } from "react";

interface FuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { liters: number; rate: number; total: number }) => void;
  }
  
 export  const FuelModal: React.FC<FuelModalProps> = ({ isOpen, onClose, onSave }) => {
    const [fuelData, setFuelData] = useState({
      liters: 0,
      rate: 0,
      total: 0,
    });
  
    useEffect(() => {
      setFuelData((prev) => ({
        ...prev,
        total: prev.liters * prev.rate,
      }));
    }, [fuelData.liters, fuelData.rate]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFuelData({ ...fuelData, [name]: parseFloat(value) });
    };
  
    const handleSave = () => {
      onSave(fuelData);
      onClose();
    };
  
    if (!isOpen) return null;
  
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Fuel Expense</h2>
  
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Liters</label>
              <input
                type="number"
                name="liters"
                value={fuelData.liters}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
  
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Rate per Liter</label>
              <input
                type="number"
                name="rate"
                value={fuelData.rate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
  
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input
                type="number"
                name="total"
                value={fuelData.total}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
  
            <div className="flex justify-end">
              <button onClick={onClose} className="mr-2 p-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button onClick={handleSave} className="p-2 bg-blue-500 text-white rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };