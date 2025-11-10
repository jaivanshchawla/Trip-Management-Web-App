import Image from 'next/image'
import { Button } from "@/components/ui/button"
import mobile_img from '@/assets/mobile-img.png'
import appQr from '@/assets/qr code.png'
import playstore from '@/assets/playstore.png'

export default function AppDownload() {
  return (
    <section className="p-4 lg:p-16 bg-white">
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-6">
        <div className="w-full lg:w-auto flex justify-center items-end h-full mt-10 lg:mt-0">
          <Image 
            src={mobile_img}
            alt="Awajahi mobile app interface" 
            width={300} 
            height={380} 
            className="lg:w-auto w-full"
          />
        </div>

        <div className="flex flex-col items-center justify-center w-full lg:w-1/2 gap-4 lg:gap-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-semibold">Download the App</h2>
          <Image 
            src={appQr}
            alt="QR code to download Awajahi app" 
            width={335} 
            height={124} 
            className="hidden sm:block"
          />
          
            <Image 
              src={playstore} 
              alt="Get it on Google Play" 
              width={250} 
              height={70} 
              className="w-full lg:w-auto"
              priority
            />
        </div>
      </div>
    </section>
  )
}

