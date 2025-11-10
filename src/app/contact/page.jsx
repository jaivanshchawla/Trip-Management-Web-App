import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import logo from '@/assets/awajahi logo.png';
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime } from 'react-icons/md';

export default function Contact() {
  return (
    <div className="w-full overflow-x-hidden text-black">
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Image
              src={logo}
              alt="Awajahi Logo"
              width={150}
              height={150}
              className="mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4 text-[#FE8631]">Contact Us</h1>
            <p className="text-xl text-gray-600">
  Get in touch with us. We&apos;d love to hear from you!
</p>

          </div>

          <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8 text-[#FE8631] text-center">Contact Information</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-[#FE8631] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdEmail className="text-[#FE8631] text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                <p className="text-gray-600">info@awajahi.com</p>
              </div>
              <div className="text-center">
                <div className="bg-[#FE8631] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdPhone className="text-[#FE8631] text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phone</h3>
                <p className="text-gray-600">+91 7999658438</p>
              </div>
              <div className="text-center">
                <div className="bg-[#FE8631] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdAccessTime className="text-[#FE8631] text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Business Hours</h3>
                <div className="text-gray-600 text-sm">
                  <p>Mon-Fri: 9AM-6PM</p>
                  <p>Sat: 9AM-2PM</p>
                  <p>Sun: Closed</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-[#FE8631] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdLocationOn className="text-[#FE8631] text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Address</h3>
                <p className="text-gray-600">Noida</p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-[#FE8631] to-[#FFC499] p-8 rounded-lg text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Need Immediate Assistance?</h2>
            <p className="text-lg mb-6">
              For urgent inquiries, call our support line or email us directly.
            </p>
            <p className="text-lg font-semibold">
              Support Hotline: +91 7999658438
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
