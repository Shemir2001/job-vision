import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import HowItWorks from '@/components/home/HowItWorks'
import FeaturedJobs from '@/components/home/FeaturedJobs'
import PopularCategories from '@/components/home/PopularCategories'
import AIFeaturesShowcase from '@/components/home/AIFeaturesShowcase'
import CountriesSection from '@/components/home/CountriesSection'
import InternshipsSection from '@/components/home/InternshipsSection'
import NewsletterSection from '@/components/home/NewsletterSection'

export default function HomePage() {
  return (
    <div className="page-transition">
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <FeaturedJobs />
      <PopularCategories />
      <AIFeaturesShowcase />
      <CountriesSection />
      {/* <InternshipsSection /> */}
      <NewsletterSection />
    </div>
  )
}

