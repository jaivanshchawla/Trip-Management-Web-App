import Image from 'next/image';
import Link from 'next/link';
import youtubeIcon from '@/assets/youtube-icon.png';
import facebookIcon from '@/assets/fb-icon.png';
import linkedinIcon from '@/assets/linkedin-icon.png';
import instagramIcon from '@/assets/insta-icon.png';
import playstore from '@/assets/playstore.png'

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li>
      <Link href={href} className="hover:text-white transition">
        {children}
      </Link>
    </li>
  );
}

export default function Footer() {
  // Map social platform names to their respective icon imports
  const socialIcons = {
    instagram: instagramIcon,
    linkedin: linkedinIcon,
    facebook: facebookIcon,
    youtube: youtubeIcon,
  };

  return (
    <footer className="bg-[#FE8631] text-black p-16 mt-0 sm:mt-10 relative">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-lg">
        <div>
          <h3 className="text-lg font-semibold mb-4">Products</h3>
          <ul className="space-y-2">
            <FooterLink href="/trip-management">Trip management</FooterLink>
            <FooterLink href="/expense-management">Expense management</FooterLink>
            <FooterLink href="/route-optimization">Route optimization</FooterLink>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <FooterLink href="/about">About us</FooterLink>
            <FooterLink href="/contact">Contact us</FooterLink>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <FooterLink href="/terms">Terms of service</FooterLink>
            <FooterLink href="/privacy-policy">Privacy & Policy</FooterLink>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
            <div className="flex space-x-4 items-center">
              {Object.entries(socialIcons).map(([social, icon]) => (
                <Link href={`#`} key={social}>
                  <Image
                    src={icon}
                    alt={`${social} icon`}
                    width={30}
                    height={30}
                    className="hover:opacity-80 transition"
                  />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Download our app</h3>
            <Link href="https://play.google.com/store/apps/details?id=com.awajahi">
              <Image
                src={playstore}
                alt="Get it on Google Play"
                width={173}
                height={51}
                className="hover:opacity-90 transition"
                priority
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-white pt-6 text-center">
        <p className="text-lg font-semibold">
          &copy; {new Date().getFullYear()} Awajahi. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
