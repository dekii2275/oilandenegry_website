import Header from '@/components/home/Header'
import HeroSection from '@/components/home/HeroSection'
import MarketPrices from '@/components/home/MarketPrices'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import SolutionsSection from '@/components/home/SolutionsSection'
import WhyEnergyMarket from '@/components/home/WhyEnergyMarket'
import VerifiedSuppliers from '@/components/home/VerifiedSuppliers'
import NewsEvents from '@/components/home/NewsEvents'
import Footer from '@/components/home/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <HeroSection />
        <MarketPrices />
        <CategoriesSection />
        <FeaturedProducts />
        <SolutionsSection />
        <WhyEnergyMarket />
        <VerifiedSuppliers />
        <NewsEvents />
      </main>
      <Footer />
    </div>
  )
}

