import Image from 'next/image'
import ScheduleDemo from '@/components/ScheduleDemo'
import heroImg from '@/assets/hero section illustration.png'

export default function HeroSection() {
  return (
    <section className="bg-gradient-radial-home px-4 sm:px-8 lg:px-16 py-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-col justify-evenly w-full lg:w-1/2 gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-semibold leading-tight text-[#333333]">
            Manage <span className="text-[#FF6A00]">Fleet Operations</span> with Ease: Increase <span className="text-[#FF6A00]">Efficiency</span> and <span className="text-[#FF6A00]">Visibility</span> Across Every Mile
          </h1>
          <p className="text-sm sm:text-md lg:text-lg font-medium text-[#666666]">
            Streamline operations, optimize routes, and drive efficiency with our AI-powered tools and IoT solutions.
          </p>
          <div className="hidden sm:flex items-end h-full">
            <ScheduleDemo />
          </div>
        </div>

        <div className="relative w-full lg:w-auto flex justify-center lg:justify-end items-end h-full mt-6 sm:mt-10 lg:mt-0">
          <Image
            src={heroImg}
            alt="Fleet management illustration"
            width={500}
            height={600}
            className="rounded-lg"
            priority
          />
        </div>

        <div className="flex items-end h-full w-full sm:hidden mt-6">
          <ScheduleDemo />
        </div>
      </div>
    </section>
  )
}

