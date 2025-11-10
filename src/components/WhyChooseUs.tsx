import Image from 'next/image'
import mainIllustrationImg from '@/assets/Group 427320428.png'

interface ReasonProps {
  title: string
  description: string
  className?: string
}

function Reason({ title, description, className = '' }: ReasonProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <h3 className="text-xl sm:text-2xl font-semibold">{title}</h3>
      <p className="leading-tight font-semibold">{description}</p>
    </div>
  )
}

export default function WhyChooseUs() {
  return (
    <section className="p-8 sm:p-16 bg-gradient-radial-home text-black">
      <h2 className="mt-10 text-3xl sm:text-5xl font-semibold text-center mb-10 sm:mb-20">Why Choose Us?</h2>

      <div className="flex flex-col sm:flex-row items-center justify-evenly mt-10 gap-10 sm:gap-0">
        <div className="w-full sm:w-1/4 flex flex-col items-start justify-between h-full space-y-10 sm:space-y-16">
          <Reason
            title="AI-Driven Optimization"
            description="Leverage cutting-edge AI technology to enhance fleet performance, minimize costs, and maximize productivity."
            className="ml-0 sm:transform sm:translate-x-64 -translate-y-0 sm:-translate-y-20"
          />
          <Reason
            title="Dedicated Support"
            description="Our expert team is available 24/7 to assist you, ensuring you get the most out of Awajahi's features and capabilities."
            className="sm:transform sm:translate-x-32 translate-y-0 sm:translate-y-5"
          />
        </div>

        <div className="w-full sm:w-auto">
          <Image 
            src={mainIllustrationImg}
            alt='Awajahi fleet management illustration' 
            width={538} 
            height={569} 
            className="mx-auto sm:mx-0" 
            priority
          />
        </div>

        <div className="w-full sm:w-1/4 flex flex-col items-start justify-between h-full space-y-10 sm:space-y-16">
          <Reason
            title="Boost Efficiency"
            description="Save time and reduce costs with automated processes."
            className="sm:transform sm:-translate-x-5 translate-y-0 sm:translate-y-20"
          />
          <Reason
            title="Real-Time Visibility"
            description="Stay in control with real-time data and insights, ensuring you're always informed and ready to make quick, informed decisions."
            className="sm:transform sm:-translate-x-40 translate-y-0 sm:translate-y-48"
          />
        </div>
      </div>
    </section>
  )
}

