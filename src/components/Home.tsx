import React from 'react'
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { GamepadIcon, Star, TrendingUp, Users, Search, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PlayToRankLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <GamepadIcon className="h-8 w-8 text-purple-500" />
          <span className="text-2xl font-bold">Play to Rank</span>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><a href="#features" className="hover:text-purple-400 transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a></li>
            <li><a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a></li>
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white" onClick={() => window.location.href = '/login'}>
            Login
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <a href="#features">Features</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="#how-it-works">How It Works</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="#contact">Contact</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Rank Your Favorite Games
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
          Discover, rate, and compare video games. Join our community of gamers and find your next favorite title!
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Play to Rank?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Star className="h-12 w-12 text-yellow-400" />}
              title="Rate Games"
              description="Share your opinions and rate games based on various criteria."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-12 w-12 text-green-400" />}
              title="Track Trends"
              description="Stay updated with the latest gaming trends and popular titles."
            />
            <FeatureCard 
              icon={<Users className="h-12 w-12 text-blue-400" />}
              title="Community"
              description="Connect with other gamers and share your gaming experiences."
            />
            <FeatureCard 
              icon={<Search className="h-12 w-12 text-purple-400" />}
              title="Discover"
              description="Find new games tailored to your preferences and play style."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
        <Carousel className="max-w-5xl mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <StepCard
                number={1}
                title="Create Account"
                description="Sign up for free and set up your gaming profile. Customize your preferences and start your journey in the world of game ranking."
              />
            </CarouselItem>
            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <StepCard
                number={2}
                title="Rate & Review"
                description="Play games, rate them based on various criteria, and write reviews to help other gamers make informed decisions."
              />
            </CarouselItem>
            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <StepCard
                number={3}
                title="Discover & Compare"
                description="Explore new games based on community rankings, compare different titles, and discover hidden gems that match your preferences."
              />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Ranking?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of gamers and start sharing your opinions today!
          </p>
          <form className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="max-w-xs bg-white text-gray-900"
            />
            <Link to="/signup" className="flex items-center gap-2 bg-yellow-500 text-gray-900 hover:bg-yellow-600 px-2 py-1 rounded-lg">
            <span className="text-lg font-semibold">Sign Up Now</span>
          </Link>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; Placeholder</p>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="bg-gray-800 border-purple-500 hover:border-purple-400 transition-colors">
      <CardHeader>
        <div className="mb-4 flex justify-center">{icon}</div>
        <CardTitle className="text-xl font-semibold mb-2 text-purple-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">{description}</p>
      </CardContent>
    </Card>
  )
}

interface StepCardProps {
  number: number
  title: string
  description: string
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <Card className="bg-gray-800 border-purple-500 h-full">
      <CardHeader>
        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-xl font-bold">{number}</span>
        </div>
        <CardTitle className="text-xl font-semibold mb-2 text-purple-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">{description}</p>
      </CardContent>
    </Card>
  )
}

export default PlayToRankLanding