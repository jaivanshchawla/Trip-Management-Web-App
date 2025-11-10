import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import tripIcon from '@/assets/trip management icon.png';

export default function TripManagement() {
  return (
    <div className="w-full overflow-x-hidden text-black">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src={tripIcon}
              alt="Trip Management Icon"
              width={100}
              height={100}
              className="mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4 text-[#FE8631]">Trip Management</h1>
            <p className="text-xl text-gray-600 mb-8">
              Streamline your logistics operations with our comprehensive trip management solution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-[#FE8631]">Key Features</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Real-time trip tracking and monitoring
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Automated route planning and optimization
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Driver and vehicle assignment
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Trip documentation and reporting
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Fuel consumption tracking
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-[#FE8631]">Benefits</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Improved operational efficiency
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Reduced transportation costs
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Better customer service with accurate ETAs
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Enhanced compliance and documentation
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Real-time visibility across your fleet
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-[#FE8631] to-[#FFC499] p-8 rounded-lg text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Trips?</h2>
            <p className="text-lg mb-6">
              Join thousands of businesses already using Awajahi for efficient trip management.
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
