import '@/app/globals.css'
import React from 'react';
import Image from 'next/image';
import logo_img from '@/assets/awajahi logo.png'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import loginIcon from '@/assets/login icon.png'

export const metadata = {
    title: 'Privacy Policy - Awajahi',
    description: 'Awajahi\'s privacy policy outlining how we collect, use, and protect your personal information when using our website and services.',
    keywords: 'Awajahi, Privacy Policy, Personal Information, Data Security, Cookies',
    openGraph: {
        title: 'Privacy Policy - Awajahi',
        description: 'Awajahi\'s Privacy Policy detailing how we handle personal and non-personal data.',
        url: 'https://www.awajahi.com/privacy-policy',
        images: [
            {
                url: '../assets/awajahi logo.png',
                width: 800,
                height: 600,
                alt: 'Awajahi Privacy Policy',
            },
        ],
        type: 'website',
    },
}

const PrivacyPolicyPage = () => {
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
                    <h1 className="text-3xl font-bold">Privacy Policy</h1>
                    <span className="text-gray-600">Last Updated: {new Date('2024-10-21').toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="mb-6">
                    <p className="text-lg">
                        At Awajahi, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web and Android applications.By using Awajahi, you agree to the terms of this Privacy Policy. If you do not agree with these terms, please do not access or use our services.
                    </p>
                </div>
                <hr className='text-[#BCBCBC]' />
                <div>
                    <ol className="list-decimal pl-6 space-y-2 text-lg" type='1'>
                        <li>
                            <strong>Information We Collect</strong>
                            <p className="ml-4 mt-2">
                                We collect several types of information to provide and improve our services:
                            </p>
                            <ol className="list-decimal pl-6 mt-2" type="1">
                                <li>
                                    <strong>Personal Information</strong>
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Name</li>
                                        <li>Email address</li>
                                        <li>Phone number</li>
                                        <li>Company details (for carriers and shippers)</li>
                                        <li>Payment information (for marketplace and invoicing features)</li>
                                    </ul>
                                </li>
                                <li className="mt-2">
                                    <strong>Operational Data</strong>
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Trip details (origin, destination, route information)</li>
                                        <li>Expense management data</li>
                                        <li>Load and shipment details</li>
                                    </ul>
                                </li>
                                <li className="mt-2">
                                    <strong>GPS Location Data</strong>
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>
                                            Real-time location data from third-party GPS tracking devices and your mobile device when using the GPS tracking feature.
                                        </li>
                                    </ul>
                                </li>
                                <li className="mt-2">
                                    <strong>Document Data</strong>
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>
                                            We collect and store documents you upload, such as invoices, E-Way Bills, RCs, and other logistical documents.
                                        </li>
                                    </ul>
                                </li>
                                <li className="mt-2">
                                    <strong>Device Information</strong>
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>IP address</li>
                                        <li>Browser type</li>
                                        <li>Device ID</li>
                                        <li>Operating system</li>
                                        <li>Mobile network information</li>
                                    </ul>
                                </li>
                                <li className="mt-2">
                                    <strong>Usage Data</strong>
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Information about interactions with the platform, such as pages viewed, buttons clicked, and time spent on each section.</li>
                                    </ul>
                                </li>
                            </ol>
                        </li>

                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>How We Use Your Information</strong>
                            <p className="ml-4 mt-2">We use your data to improve our services, provide a seamless user experience, and ensure efficient logistics management:</p>
                            <ol className="list-decimal pl-6 mt-2">
                                <li>
                                    <strong>Service Delivery</strong>
                                    <p className="ml-4 mt-1">
                                        To manage your account, provide customer support, and respond to inquiries.<br />
                                        To facilitate trip and expense management, GPS tracking, and document management.<br />
                                        To enable marketplace functionalities like bidding and load management between carriers and shippers.
                                    </p>
                                </li>
                                <li className="mt-2">
                                    <strong>Analytics and Improvements</strong>
                                    <p className="ml-4 mt-1">
                                        To understand how users interact with our platform and improve its functionality.<br />
                                        To monitor usage patterns, user feedback, and operational performance for platform optimization.
                                    </p>
                                </li>
                                <li className="mt-2">
                                    <strong>Marketing and Communication</strong>
                                    <p className="ml-4 mt-1">
                                        To send you notifications about updates, new features, or marketing materials, subject to your communication preferences.<br />
                                        To notify you about relevant offers, promotions, or events related to Awajahi.
                                    </p>
                                </li>
                                <li className="mt-2">
                                    <strong>Security and Fraud Prevention</strong>
                                    <p className="ml-4 mt-1">
                                        To detect, prevent, and respond to fraud, unauthorized activities, or security threats on the platform.
                                    </p>
                                </li>
                            </ol>
                        </li>

                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>Sharing Your Information</strong>
                            <p className="ml-4 mt-2">
                                We do not sell or share your personal information with third parties except in the following circumstances:
                            </p>
                            <ol className="list-decimal pl-6 mt-2">
                                <li>
                                    <strong>Third-Party Service Providers</strong>
                                    <p className="ml-4 mt-1">
                                        We may share your information with trusted third-party service providers who help us operate the platform, including:
                                        <ul className="list-disc pl-6 mt-1">
                                            <li>Payment gateways (e.g., Paytm, PhonePe)</li>
                                            <li>GPS tracking hardware providers</li>
                                            <li>Cloud storage and hosting services</li>
                                        </ul>
                                        These providers are obligated to protect your data and use it only for the services they are providing to Awajahi.
                                    </p>
                                </li>
                                <li className="mt-2">
                                    <strong>Business Transfers</strong>
                                    <p className="ml-4 mt-1">
                                        In the event of a merger, acquisition, or asset sale, your information may be transferred as part of the transaction. You will be notified of any such change in ownership or control.
                                    </p>
                                </li>
                                <li className="mt-2">
                                    <strong>Legal Obligations</strong>
                                    <p className="ml-4 mt-1">
                                        We may disclose your information if required by law or to comply with legal processes such as a subpoena, court order, or governmental regulation.
                                    </p>
                                </li>
                            </ol>
                        </li>

                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>Data Security</strong>
                            <p className="ml-4 mt-2">We take reasonable measures to secure your data, using industry-standard encryption protocols to protect personal and operational information. However, no method of transmission over the internet is completely secure. While we strive to protect your information, we cannot guarantee its absolute security.</p>
                        </li>
                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>Data Retention</strong>
                            <p className='ml-4 mt-2'>We will retain your information for as long as your account is active or as necessary to provide our services. You may request deletion of your account and data at any time, subject to certain legal or business requirements to retain specific information.</p>
                        </li>
                        <li>
                            <strong>Your Data Rights</strong>
                            <p className="ml-4 mt-2">
                                Depending on your jurisdiction, you may have the following rights concerning your personal data:
                            </p>
                            <ol className="list-decimal pl-6 mt-2">
                                <li>
                                    <strong>Access</strong>
                                    <p className="ml-4 mt-1">
                                        You can request a copy of the data we hold about you.
                                    </p>
                                </li>
                                <li className="mt-2">
                                    <strong>Correction</strong>
                                    <p className="ml-4 mt-1">
                                        You can request that we update or correct inaccurate information.
                                    </p>
                                </li>
                                <li className="mt-2">
                                    <strong>Deletion</strong>
                                    <p className="ml-4 mt-1">
                                        You can request that we delete your personal data, subject to legal retention requirements.
                                    </p>
                                </li>
                                <li className="mt-2">
                                    <strong>Objection</strong>
                                    <p className="ml-4 mt-1">
                                        You can object to the processing of your data for specific purposes, like marketing.
                                    </p>
                                </li>
                            </ol>
                            <p className="ml-4 mt-4">
                                To exercise any of these rights, please contact us at <a href="mailto:info@awajahi.com">info@awajahi.com</a>.
                            </p>
                        </li>
                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>Cookies and Tracking Technologies</strong>
                            <p className="ml-4 mt-2">We may use cookies and similar tracking technologies to monitor activity on our platform and store certain information. You can modify your browser settings to disable cookies, but doing so may affect your ability to use certain features of the platform.</p>
                        </li>
                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>Third Party Links</strong>
                            <p className="ml-4 mt-2">Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage users to review the privacy policies of any third-party websites they visit</p>
                        </li>
                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>Children Privacy</strong>
                            <p className='ml-4 mt-2'>Awajahi is not intended for use by individuals under the age of 18. We do not knowingly collect or store personal information from children under the age of 18. If we become aware of such data, it will be deleted immediately.</p>
                        </li>
                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>Changes to this Privacy Policy</strong>
                            <p className='ml-4 mt-2'>We reserve the right to update or modify this Privacy Policy at any time. Any changes will be communicated to users via email or through a notification on the platform. Your continued use of the platform after such changes indicates your acceptance of the updated policy.</p>
                        </li>
                        <hr className='text-[#BCBCBC]' />
                        <li>
                            <strong>Contact Us</strong>
                            <p className="ml-4 mt-2">
                                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
                            </p>
                            <p className="ml-4 mt-1">
                                Email: <a href="mailto:info@awajahi.com">info@awajahi.com</a>
                            </p>
                        </li>

                    </ol>
                </div>
                <footer className="mt-8 text-center">
                    <a className="text-blue-600">By using our website, you agree to this Privacy Policy.</a>
                </footer>
            </div>
        </div>

    );
};

export default PrivacyPolicyPage;
