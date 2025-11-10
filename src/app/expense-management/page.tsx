import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import expenseIcon from '@/assets/expense management icon.png';

export default function ExpenseManagement() {
  return (
    <div className="w-full overflow-x-hidden text-black">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src={expenseIcon}
              alt="Expense Management Icon"
              width={100}
              height={100}
              className="mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4 text-[#FE8631]">Expense Management</h1>
            <p className="text-xl text-gray-600 mb-8">
              Take control of your business expenses with our intelligent expense tracking and management system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-[#FE8631]">Key Features</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Automated expense categorization
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Receipt scanning and OCR processing
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Real-time expense tracking
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Budget monitoring and alerts
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Multi-currency support
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-[#FE8631]">Benefits</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Reduced administrative overhead
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Improved financial visibility
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Faster expense approvals
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Better compliance with tax regulations
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Cost savings through better tracking
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-[#FE8631] to-[#FFC499] p-8 rounded-lg text-white">
            <h2 className="text-3xl font-bold mb-4">Streamline Your Expenses Today</h2>
            <p className="text-lg mb-6">
              Experience hassle-free expense management with Awajahi&apos;s advanced platform.
            </p>
            <button className="bg-white text-[#FE8631] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Schedule a Demo
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
