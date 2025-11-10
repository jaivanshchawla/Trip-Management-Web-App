import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import routeIcon from '@/assets/route management icon.png';

export default function RouteOptimization() {
  return (
    <div className="w-full overflow-x-hidden text-black">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src={routeIcon}
              alt="Route Optimization Icon"
              width={100}
              height={100}
              className="mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4 text-[#FE8631]">Route Optimization</h1>
            <p className="text-xl text-gray-600 mb-8">
              Maximize efficiency and minimize costs with our advanced route optimization technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-[#FE8631]">Key Features</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  AI-powered route planning
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Real-time traffic integration
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Multi-stop optimization
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Fuel efficiency calculations
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Delivery time predictions
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-[#FE8631]">Benefits</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Significant reduction in fuel costs
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Improved delivery times and customer satisfaction
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Lower vehicle wear and maintenance costs
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Reduced carbon footprint
                </li>
                <li className="flex items-start">
                  <span className="text-[#FE8631] mr-2">•</span>
                  Increased fleet utilization
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-[#FE8631] to-[#FFC499] p-8 rounded-lg text-white">
            <h2 className="text-3xl font-bold mb-4">Optimize Your Routes Now</h2>
            <p className="text-lg mb-6">
              Discover how Awajahi&apos;s route optimization can transform your logistics operations.
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
