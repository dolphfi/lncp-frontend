import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Types TypeScript
interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
}

interface VisibleSlide extends Slide {
  offset: number;
  isCenter: boolean;
}

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Données du carrousel avec images et statistiques
  const slides: Slide[] = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
      title: "Bienvenue à LNCP",
      subtitle: "Lycée National Charlemagne Péralte",
      description:
        "Plus de 2,500 élèves formés depuis notre création en 1985. 95% de réussite au baccalauréat sur les 5 dernières années.",
      cta: "Découvrir",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
      title: "Bienvenue à LNCP",
      subtitle: "Lycée National Charlemagne Péralte",
      description:
        "180 enseignants qualifiés et dévoués. 45 salles de classe modernes équipées de technologies éducatives avancées.",
      cta: "En savoir plus",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
      title: "Bienvenue à LNCP",
      subtitle: "Lycée National Charlemagne Péralte",
      description:
        "15 filières d'études disponibles. 3 laboratoires scientifiques équipés et 1 centre informatique avec 60 ordinateurs.",
      cta: "Nos filières",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
      title: "Bienvenue à LNCP",
      subtitle: "Lycée National Charlemagne Péralte",
      description:
        "1,200 élèves actuellement inscrits. 8 activités parascolaires proposées incluant sports, arts et clubs scientifiques.",
      cta: "Activités",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      title: "Bienvenue à LNCP",
      subtitle: "Lycée National Charlemagne Péralte",
      description:
        "Bibliothèque de 12,000 ouvrages. 98% de nos diplômés poursuivent leurs études supérieures avec succès.",
      cta: "Statistiques",
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number): void => {
    setCurrentSlide(index);
  };

  // Get visible slides for center mode effect
  const getVisibleSlides = () => {
    const visibleSlides = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentSlide + i + slides.length) % slides.length;
      visibleSlides.push({
        ...slides[index],
        offset: i,
        isCenter: i === 0,
      });
    }
    return visibleSlides;
  };

  return (
    <div id="home" className="min-h-screen text-white overflow-hidden relative">
      {/* Dynamic Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-blue-950/90" />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="relative h-screen flex items-center justify-center z-10 -mt-20">
        <div className="text-center space-y-8 max-w-4xl px-6">
          {/* Welcome Message */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight font-['Kaushan_Script']">
              Bienvenue à LNCP
            </h1>
            <h2 className="text-lg lg:text-xl text-blue-200 font-light">
              Lycée National Charlemagne Péralte
            </h2>

            <div className="space-y-3">
              {/* <div className="text-sm text-blue-300 font-semibold uppercase tracking-wider">
                {slides[currentSlide].subtitle}
              </div> */}
              {/* <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                {slides[currentSlide].title}
              </h3> */}
              <p className="text-sm lg:text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto">
                {slides[currentSlide].description}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <button className="flex items-center bg-secondary/10 text-secondary text-xs py-3 px-8 rounded-full hover:bg-secondary/20 transition-all duration-300 border border-secondary/20 hover:border-secondary/40">
              Admissions
            </button>

            {/* Slide Indicators */}
            <div className="flex space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-blue-400 w-8"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {/* <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-all duration-300 border border-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-all duration-300 border border-white/20"
        >
          <ChevronRight className="w-6 h-6" />
        </button> */}
      </div>

      {/* Thumbnail Gallery at Bottom */}
      <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                index === currentSlide
                  ? "w-20 h-12 border-2 border-blue-400 shadow-lg shadow-blue-400/30"
                  : "w-16 h-10 border border-white/30 opacity-70 hover:opacity-100 hover:border-white/50"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {/* <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30 z-30">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-75 ease-linear"
          style={{
            width: isAutoPlaying
              ? `${((currentSlide + 1) / slides.length) * 100}%`
              : "0%",
          }}
        />
      </div> */}
      {/* Paper Image at bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full">
        <img
          src="/overlay-bottom.png"
          alt="Paper decoration"
          className="w-full object-cover"
        />
      </div>
    </div>
  );
};

export default HomePage;
