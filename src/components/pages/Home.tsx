import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
  const [isAutoPlaying] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<Slide | null>(null);

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
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = (): void => {
    setCurrentSlide((prev: number) => (prev + 1) % slides.length);
  };

  const prevSlide = (): void => {
    setCurrentSlide(
      (prev: number) => (prev - 1 + slides.length) % slides.length
    );
  };


  const openImageModal = (slide: Slide): void => {
    setSelectedImage(slide);
  };

  const closeImageModal = (): void => {
    setSelectedImage(null);
  };

  // Get visible slides for center mode effect
  const getVisibleSlides = (): VisibleSlide[] => {
    const visibleSlides: VisibleSlide[] = [];
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
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* Dynamic Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/50 to-blue-900/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-900/90" />
          {/* Overlay bleu sur tout le fond */}
          <div className="absolute inset-0 bg-blue-900/60" />
        </div>
      </div>

      {/* Main Carousel Section avec nouvelles marges */}
      <div className="relative h-screen flex items-center z-10">
        <div className="container mx-auto px-6 md:px-16 lg:px-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8 z-10 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold font-['Kaushan_Script']">
              Bienvenue à LNCP
            </h1>
            <p className="text-lg md:text-xl text-gray-200">
              Lycée national Charlemagne Péralte
            </p>
            <div className="flex justify-center lg:justify-start">
              <button
                type="button"
                className="flex items-center bg-secondary text-primary font-medium text-xs py-1.5 px-4 rounded-full hover:bg-blue-700 transition-colors duration-300"
              >
                <span>Admission</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 9l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side - Carousel Gallery Thumbnails */}
          <div className="relative h-96 lg:h-[500px]">
            <div className="relative w-full h-full overflow-hidden">
              {/* Center Mode Carousel - Now showing thumbnails */}
              <div className="flex items-center justify-center h-full">
                {getVisibleSlides().map(
                  (slide: VisibleSlide, index: number) => (
                    <div
                      key={`${slide.id}-${slide.offset}`}
                      className={`absolute transition-all duration-700 ease-in-out cursor-pointer group ${
                        slide.isCenter
                          ? "z-10 scale-100 opacity-100"
                          : "scale-75 opacity-50 hover:opacity-70"
                      }`}
                      style={{
                        transform: `translateX(${slide.offset * 100}px) scale(${
                          slide.isCenter ? 1 : 0.75
                        })`,
                        zIndex: slide.isCenter
                          ? 10
                          : 5 - Math.abs(slide.offset),
                      }}
                      onClick={() => openImageModal(slide)}
                    >
                      <div className="relative">
                        <div
                          className={`w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300 ${
                            slide.isCenter
                              ? "border-blue-400"
                              : "border-white/20 hover:border-white/40"
                          }`}
                        >
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {/* Overlay bleu sur chaque image du carousel */}
                          <div className="absolute inset-0 bg-blue-900/30" />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-blue-900/80 rounded-full hover:bg-blue-900/90 transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-blue-900/80 rounded-full hover:bg-blue-900/90 transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 z-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </div>

      {/* Modal pour affichage en grand plan */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full">
            {/* Bouton fermer */}
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X size={32} />
            </button>

            {/* Image en grand avec overlay bleu */}
            <div className="relative group">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              {/* Overlay bleu sur l'image modale */}
              <div className="absolute inset-0 bg-blue-900/40 rounded-lg" />

              {/* Overlay avec informations */}
              <div className="absolute bottom-0 left-0 right-0 bg-blue-900/90 text-white p-6 rounded-b-lg">
                <div className="space-y-2">
                  <div className="text-sm uppercase tracking-wider text-blue-200 font-semibold">
                    {selectedImage.subtitle}
                  </div>
                  <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
                  <p className="text-gray-200">{selectedImage.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clic sur le fond pour fermer */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeImageModal}
          ></div>
        </div>
      )}

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
