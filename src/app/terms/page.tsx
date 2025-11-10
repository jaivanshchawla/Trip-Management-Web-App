import '@/app/globals.css'
import React from 'react';
import Image from 'next/image';
import logo_img from '@/assets/awajahi logo.png'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import loginIcon from '@/assets/login icon.png'

export const metadata = {
    title: 'Terms and Conditions - Awajahi',
    description: 'Awajahi\'s terms and conditions outlining the rules and guidelines for using our website and services. By accessing our services, you agree to comply with these terms.',
    keywords: 'Awajahi, Terms and Conditions, User Agreement, Service Terms, Legal Policy',
    openGraph: {
        title: 'Terms and Conditions - Awajahi',
        description: 'Awajahi\'s terms and conditions detailing how users can engage with our website and services. Understand your rights and responsibilities while using Awajahi.',
        url: 'https://www.awajahi.com/terms',
        images: [
            {
                url: '../assets/awajahi logo.png',
                width: 800,
                height: 600,
                alt: 'Awajahi Terms and Conditions',
            },
        ],
        type: 'website',
    },
}


const TermsPage = () => {
    return (
        <div className='w-full bg-[radial-gradient(ellipse_at_80%_50%,_#FFC499_0%,_#FFFFFF_80%)]'>
            <div className="container mx-auto p-4  text-black" suppressHydrationWarning>
                <div className="flex flex-wrap justify-between items-center w-full py-4 sm:py-6">
                    {/* Logo Section */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Image
                            src={logo_img}
                            alt="Awajahi Logo"
                            width={60}
                            height={60}
                            className="w-[25px] h-[27px] sm:w-[60px] sm:h-[60px]"
                        />
                        <Link href={'/'}><span className="text-lg sm:text-2xl font-bold text-black">Awajahi</span></Link>
                    </div>

                    {/* Navigation Links Section */}
                    <ul className="hidden sm:flex items-center space-x-4 sm:space-x-8 md:space-x-16 text-lg sm:text-xl md:text-2xl font-semibold text-[#333333]">
                        <li>
                            <Link href="/" className="hover:text-[#FF6A00] transition-colors duration-300">About Us</Link>
                        </li>
                        <li>
                            <Link href="/login" className="hover:text-[#FF6A00] transition-colors duration-300 flex items-center">
                                <span>Login</span>
                                <Image src={loginIcon} width={24} height={24} className="sm:w-6 sm:h-6" alt="login" />
                            </Link>
                        </li>
                        <li>
                            <Link href="/login">
                                <Button className="rounded-full bg-[#CC5500] text-white px-4 sm:px-6 py-2 sm:py-3 font-bold text-md sm:text-lg">
                                    Sign Up
                                </Button>
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Terms and Conditions</h1>
                    <span className="text-gray-600">Last Updated: {new Date('2024-10-21').toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="mb-6">
                    <p className="text-lg">
                        Welcome to Awajahi, a platform designed for efficient management of logistics, trip planning, expense tracking, document management, and fleet management. These terms and conditions outline the rules and regulations for the use of the Awajahi web and Android applications.By accessing or using our services, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the services.
                    </p>
                </div>
                <hr className='text-[#BCBCBC]' />
                <div>
                    <div className="privacy-policy">
                        <h2 className="text-2xl font-bold">Definitions</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li><strong>Platform</strong>: Refers to both the web and mobile applications of Awajahi.</li>
                            <li><strong>User</strong>: Refers to anyone who accesses or uses the platform, including carriers, shippers, drivers, or fleet owners.</li>
                            <li><strong>Company</strong>: Refers to Awajahi.</li>
                            <li><strong>Content</strong>: Refers to any data, information, or material posted or available on the platform.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">User Accounts</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Users must register an account to access certain services. You are responsible for maintaining the confidentiality of your account details and agree to notify us immediately of any unauthorized use.</li>
                            <li>Users agree to provide accurate and complete information when registering and using the platform.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Use of the Platform</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Awajahi provides tools for managing logistics operations, including trip planning, expense tracking, document management, and marketplace functionalities.</li>
                            <li>Users agree not to misuse the platform for illegal purposes and to use it in compliance with all applicable laws and regulations.</li>
                            <li>You are solely responsible for any content you post or upload on the platform, including but not limited to documents, load details, invoices, or messages.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Payment and Billing</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Awajahi may offer payment features to facilitate transactions between shippers and carriers. However, Awajahi is not responsible for the payments between parties; we only provide a platform to assist in this process.</li>
                            <li>Users must agree to the terms of the third-party payment gateways integrated into the platform, such as Paytm and PhonePe, if applicable.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Marketplace</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Carriers and shippers can post loads and bid on jobs. The terms and conditions of any contract or bid are between the shipper and the carrier. Awajahi does not participate in, endorse, or guarantee any transaction between users.</li>
                            <li>Awajahi reserves the right to moderate or remove any bids or listings that violate our policies or are deemed inappropriate.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">GPS Tracking</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Awajahi may use third-party hardware and services for GPS tracking. By using this feature, you agree to Awajahi and its third-party partners processing your location data.</li>
                            <li>Awajahi is not responsible for inaccuracies in location data provided by third-party devices or services.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Document Management</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>The platform provides a document management system where users can upload, store, and manage logistics-related documents such as invoices, receipts, RCs, E-Way Bills, etc.</li>
                            <li>Users are responsible for ensuring the accuracy and legality of all uploaded documents. Awajahi does not verify or endorse the authenticity of any documents uploaded by users.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Data Privacy</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Awajahi values your privacy and adheres to applicable data protection laws. Your personal and operational data will be stored securely and only used in accordance with our Privacy Policy.</li>
                            <li>By using the platform, you consent to the collection and use of your data as outlined in our Privacy Policy.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Intellectual Property</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>All content and materials available on the platform, including but not limited to text, graphics, logos, and software, are the property of Awajahi or its licensors and are protected by intellectual property laws.</li>
                            <li>Users are prohibited from copying, distributing, or creating derivative works from any content on the platform without prior written permission from Awajahi.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Limitation of Liability</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Awajahi is provided &quot;as is&quot; and &quot;as available.&quot; We do not guarantee that the platform will always be available, error-free, or secure. We disclaim all liability for any damages arising from the use or inability to use the platform.</li>
                            <li>Awajahi will not be held responsible for any loss or damage, including financial losses, that may occur due to delays, interruptions, or failures in the platform’s functionality.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Termination</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Awajahi reserves the right to terminate or suspend your account at any time for violation of these terms or if we suspect unlawful activity.</li>
                            <li>Upon termination, your access to the platform will cease immediately, and all content uploaded by you may be deleted.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Changes to Terms</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>Awajahi reserves the right to modify these terms at any time. Users will be notified of significant changes via email or a notification on the platform.</li>
                            <li>Continued use of the platform after the modification of terms constitutes your acceptance of the updated terms.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Governing Law</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>These terms are governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi, India.</li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-6">Contact Us</h2>
                        <ul className="list-disc pl-6 mt-2 text-lg">
                            <li>For any questions or concerns regarding these terms, please contact us at: <a className='text-blue-500' href="mailto:info@awajahi.com">info@awajahi.com</a></li>
                        </ul>


                    </div>

                </div>
            </div>
        </div>


    );
};

export default TermsPage;
