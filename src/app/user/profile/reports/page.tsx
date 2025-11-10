"use client";


import React, { useState, Suspense, useRef } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/app/user/loading";
import { Loader2, X } from "lucide-react";

import { useToast } from "@/components/hooks/use-toast";
import dynamic from "next/dynamic";

const ReportPage: React.FC = () => {
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [reportGernerating, setReportGenerating] = useState<boolean>(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const reportRef = useRef<any>(null)
  const { toast } = useToast()
  const Report = dynamic(()=>import('@/components/Report'), {ssr : false})

  const handleGenerateReport = async () => {
    if (!month || !year) {
      toast({
        description: 'Please select month and year',
        variant: 'warning'
      })
      return;
    }
    setReportGenerating(true);
    const response = await fetch(
      `/api/generateReport?month=${month}&year=${year}`
    );

    if (response.ok) {
      const reportHtml = await response.text();
      setReportContent(reportHtml);
      setModalOpen(true); // Open modal-like div to display the report
    } else {
      setError("Failed to generate report");
    }
    setReportGenerating(false);
  };



  return (
    <Suspense fallback={<Loading />}>
      <div className="max-w-4xl container border border-gray-300 shadow-md rounded-lg p-8 overflow-hidden">
        <h2 className="text-2xl font-bold text-bottomNavBarColor mb-4">
          Generate Report
        </h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">Select Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>

            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mt-4">
              Year
            </label>
            <input
              id="year"
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., 2024"
              required
            />
          </div>

          <Button disabled={reportGernerating} type="button" className="mt-6" onClick={handleGenerateReport}>
            {reportGernerating ? <Loader2 className="text-white animate-spin" /> : 'Generate Report'}
          </Button>
        </div>

        <div className="p-10 text-center text-sm">
          {error && <p className="text-red-500">{error}</p>}
        </div>

        {isModalOpen && reportContent && (
          <Report reportContent={reportContent} setModalOpen={setModalOpen} reportRef={reportRef} month={month} year={year}/>
        )}
      </div>
    </Suspense>
  );
};

export default ReportPage;
