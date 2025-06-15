import React, { useState } from "react";
import Masonry from "react-masonry-css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

// Types pour les images et les catégories
interface Image {
  id: number;
  src: string;
  alt: string;
  category: string;
}

// Données de démonstration (à remplacer par les données de la BDD)
const images: Image[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
    alt: "Activité culturelle - Théâtre",
    category: "culturel",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800",
    alt: "Activité sportive - Course",
    category: "sportif",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
    alt: "Activité culturelle - Musique",
    category: "culturel",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
    alt: "Activité éducative - Bibliothèque",
    category: "educatif",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800",
    alt: "Activité sportive - Basketball",
    category: "sportif",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    alt: "Activité éducative - Laboratoire",
    category: "educatif",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    alt: "Activité culturelle - Danse",
    category: "culturel",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
    alt: "Activité sportive - Natation",
    category: "sportif",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    alt: "Activité éducative - Cours",
    category: "educatif",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    alt: "Activité culturelle - Exposition",
    category: "culturel",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
    alt: "Activité sportive - Tennis",
    category: "sportif",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    alt: "Activité éducative - Atelier",
    category: "educatif",
  },
];

const categories = [
  { id: "all", name: "Toutes" },
  { id: "culturel", name: "Culture" },
  { id: "sportif", name: "Sport" },
  { id: "educatif", name: "Éducation" },
];

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 15;

  const filteredImages =
    selectedCategory === "all"
      ? images
      : images.filter((image) => image.category === selectedCategory);

  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const displayedImages = filteredImages.slice(
    startIndex,
    startIndex + imagesPerPage
  );

  const breakpointColumns = {
    default: 4,
    1400: 3,
    900: 2,
    600: 1,
  };

  return (
    <div
      id="gallery"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50"
    >
      <div className="px-6 md:px-16 lg:px-32 pt-20 pb-16 md:pb-0">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-secondary mb-4 font-['Kaushan_Script']">
            Collection
          </h1>
          <p className="text-sm max-w-2xl mx-auto leading-relaxed">
            Une sélection raffinée d'activités culturelles, sportives et
            éducatives
          </p>
        </div>

        {/* Navigation filtrée */}
        <div className="flex justify-center mb-20">
          <nav className="relative">
            <div className="flex items-center space-x-12">
              {categories.map((category) => {
                const count =
                  category.id === "all"
                    ? images.length
                    : images.filter((img) => img.category === category.id)
                        .length;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
                    className={`text-dark/70 hover:text-secondary text-xs cursor-pointer duration-300 relative group ${
                      selectedCategory === category.id ? "text-secondary" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`${
                          selectedCategory === category.id
                            ? "text-secondary"
                            : ""
                        }`}
                      >
                        {category.name}
                      </span>

                      <span className="text-[10px] text-gray-400">
                        ({count})
                      </span>
                    </span>
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all duration-300 ${
                        selectedCategory === category.id
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Masonry Grid */}
        <div className="relative">
          <PhotoProvider
            maskOpacity={0.8}
            maskClassName="backdrop-blur-sm"
            toolbarRender={() => <></>}
          >
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {displayedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="mb-4"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
                    <PhotoView src={image.src}>
                      <div className="relative cursor-pointer">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    </PhotoView>
                  </div>
                </div>
              ))}
            </Masonry>
          </PhotoProvider>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-secondary"
              }`}
            >
              Précédent
            </button>
            <div className="flex items-center space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-8 h-8 rounded-lg text-sm ${
                    currentPage === index + 1
                      ? "bg-secondary text-white"
                      : "text-gray-600 hover:text-secondary"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-secondary"
              }`}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
