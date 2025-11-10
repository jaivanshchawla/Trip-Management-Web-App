import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import logo_img from '@/assets/awajahi logo.png'
import loginIcon from '@/assets/login icon.png'

export default function Navigation() {
  return (
    <nav className="bg-gradient-radial-home px-4 sm:px-8 lg:px-16 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center w-full">
        <Link href="/" className="flex items-center space-x-2 sm:space-x-4">
          <Image
            src={logo_img}
            alt="Awajahi Logo"
            width={60}
            height={60}
            className="w-[25px] h-[27px] sm:w-[60px] sm:h-[60px]"
            priority
          />
          <span className="text-lg sm:text-2xl font-bold text-black">Awajahi</span>
        </Link>

        <ul className="hidden sm:flex items-center space-x-4 sm:space-x-8 md:space-x-16 text-lg sm:text-xl md:text-2xl font-semibold text-[#333333]">
          <li>
            <Link href="/about" className="hover:text-[#FF6A00] transition-colors duration-300">About Us</Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-[#FF6A00] transition-colors duration-300 flex items-center">
              <span>Login</span>
              <Image src={loginIcon} width={24} height={24} className="sm:w-6 sm:h-6 ml-2" alt="login" />
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
    </nav>
  )
}

