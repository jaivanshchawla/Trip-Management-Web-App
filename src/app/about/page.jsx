import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import logo from '@/assets/awajahi logo.png';

export default function About() {
  return (
    <div className="w-full overflow-x-hidden text-black">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src={logo}
              alt="Awajahi Logo"
              width={150}
              height={150}
              className="mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4 text-[#FE8631]">About Awajahi</h1>
            <p className="text-xl text-gray-600 mb-8">
              Revolutionizing logistics and transportation management for businesses across India.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-[#FE8631]">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                To empower transportation businesses with cutting-edge technology that simplifies operations,
                reduces costs, and enhances efficiency. We believe in making logistics accessible to every
                business, from small fleet operators to large enterprises.
              </p>
              <p className="text-gray-700">
                Our platform integrates trip management, expense tracking, route optimization, and document
                management into a single, user-friendly solution.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-[#FE8631]">Our Vision</h2>
              <p className="text-gray-700 mb-4">
                To be the leading digital transformation partner for the Indian logistics industry,
                driving innovation and sustainability in transportation operations.
              </p>
              <p className="text-gray-700">
                We envision a future where every logistics operation is optimized, transparent,
                and environmentally conscious, contributing to India&apos;s economic growth.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md mb-12">
            <h2 className="text-3xl font-bold mb-6 text-[#FE8631]">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Trip Management</h3>
                <p className="text-gray-600">
                  Comprehensive trip tracking, driver management, and real-time monitoring
                  to ensure smooth operations.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Expense Management</h3>
                <p className="text-gray-600">
                  Automated expense categorization, receipt scanning, and budget tracking
                  for better financial control.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Route Optimization</h3>
                <p className="text-gray-600">
                  AI-powered route planning that reduces fuel costs, delivery times,
                  and environmental impact.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#FE8631] to-[#FFC499] p-8 rounded-lg text-white">
            <h2 className="text-3xl font-bold mb-4">Join the Awajahi Revolution</h2>
            <p className="text-lg mb-6">
              Experience the future of logistics management. Transform your operations with Awajahi today.
            </p>
            <a href="/login" className="bg-white text-[#FE8631] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
              Get Started
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
