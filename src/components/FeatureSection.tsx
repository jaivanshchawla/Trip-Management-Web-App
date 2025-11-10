import Image from 'next/image'
import section3Img from '@/assets/section3-img.png'
import expenseMgmtIcon from '@/assets/expense management icon.png'
import tripMgntIcon from '@/assets/trip management icon.png'
import aiIcon from '@/assets/ai icon.png'
import routeIcon from '@/assets/route management icon.png'
import commingSoon from '@/assets/comming-soon.png'

interface FeatureProps {
  icon: string | any
  title: string
  description: string
  comingSoon?: boolean
}

function Feature({ icon, title, description, comingSoon = false }: FeatureProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <Image src={icon} alt={`${title} icon`} width={48} height={48} />
      <div className="flex flex-col">
        <h3 className="text-xl sm:text-2xl font-semibold text-[#FF6A00] flex items-center gap-2">
          <span>{title}</span>
          {comingSoon && (
            <Image src={commingSoon} alt="coming soon" width={116} height={20} />
          )}
        </h3>
        <p className="text-base sm:text-lg leading-tight text-[#666666]" style={{ maxWidth: '300px', lineHeight: '1.4em' }}>
          {description}
        </p>
      </div>
    </div>
  )
}

export default function FeatureSection() {
  return (
    <section className="p-8 sm:p-16 bg-gradient-radial-home">
      <div className="flex flex-col gap-8 sm:gap-16">
        <h2 className="text-center font-semibold text-3xl sm:text-5xl text-black">Features</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8">
          <Feature
            icon={expenseMgmtIcon}
            title="Expense Management"
            description="Simplify expense tracking and manage costs effortlessly."
          />
          <Feature
            icon={tripMgntIcon}
            title="Trip Management"
            description="Efficiently plan, track, and manage every trip with real-time insights."
          />
        </div>

        <div className="hidden sm:flex justify-center">
          <Image src={section3Img} alt="Fleet management features illustration" width={1000} height={613} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8">
          <Feature
            icon={aiIcon}
            title="AI Fleet Management"
            description="Optimize vehicle performance and reduce downtime with AI-powered insights."
            comingSoon={true}
          />
          <Feature
            icon={routeIcon}
            title="Route Optimization"
            description="Find the fastest, most cost-effective routes with AI-driven optimization."
            comingSoon={true}
          />
        </div>
      </div>
    </section>
  )
}

