import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Image src="/awajahi logo.png" height={40} width={40} alt="Awajahi Logo" className="mr-3" />
            <h1 className="text-xl font-semibold text-gray-800">Awajahi</h1>
          </div>
          <Link href="/user/home">
            <Button variant="outline">Back to User Home</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

