import { formatNumber } from "@/utils/utilArray";
import React, { useEffect } from "react";

interface BillingInfoProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const BillingInfo: React.FC<BillingInfoProps> = ({ formData, handleChange, setFormData }) => {
  useEffect(() => {
    // If billing type is not Fixed, calculate the new amount
    if (formData.billingType !== "Fixed") {
      const newAmount = (parseFloat(formData.perUnit) || 0) * (parseFloat(formData.totalUnits) || 0);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        amount: newAmount,
      }));
    }
  }, [formData.billingType, formData.perUnit, formData.totalUnits, setFormData]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "0") {
      handleChange({
        target: { name: e.target.name, value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };



  return (
    <div className="billing-info">
      <h2 className=" font-semibold mb-2">Billing Information</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {["Fixed", "Per Tonne", "Per Kg", "Per Trip", "Per Day", "Per Hour", "Per Litre", "Per Bag"].map((type) => (
          <button
            key={type}
            type="button"
            className={`p-2 rounded-md ${
              formData.billingType === type ? "bg-bottomNavBarColor text-white" : "bg-lightOrange text-buttonTextColor"
            }`}
            onClick={() =>
              handleChange({
                target: { name: "billingType", value: type },
              } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)
            }
          >
            {type}
          </button>
        ))}
      </div>
      {formData.billingType === "Fixed" ? (
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1">Freight Amount*</span>
          <input
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            type="text"
            name="amount"
            value={formatNumber(formData.amount)}
            placeholder="Freight Amount"
            onChange={handleChange}
            onFocus={handleFocus}
            required
          />
        </label>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700">{formData.billingType}</span>
              <input
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                type="number"
                name="perUnit"
                value={formData.perUnit || ""}
                placeholder="Per Unit"
                onChange={handleChange}
                onFocus={handleFocus}
                required
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Total {formData.billingType?.split(" ")[1]}s</span>
              <input
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                type="number"
                name="totalUnits"
                value={formData.totalUnits || ""}
                placeholder="Total Units"
                onChange={handleChange}
                onFocus={handleFocus}
                required
              />
            </label>
          </div>
          <label className="block">
            <span className="text-gray-700 text-sm">Freight Amount</span>
            <input
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              type="text"
              name="amount"
              value={formatNumber(formData.amount)}
              placeholder="Freight Amount"
              readOnly
            />
          </label>
        </>
      )}
    
    </div>
  );
};
