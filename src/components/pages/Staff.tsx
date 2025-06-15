import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  User,
  Users,
} from "lucide-react";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  address: string;
  image: string;
}

const Staff = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const staffMembers: StaffMember[] = [
    {
      id: 1,
      name: "Dr. Marie Dupont",
      role: "Directrice Générale",
      phone: "+509 3456-7890",
      email: "marie.dupont@lncp.edu.ht",
      address: "Bureau 101, Administration",
      image:
        "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    },
    {
      id: 2,
      name: "Prof. Jean Baptiste",
      role: "Directeur Pédagogique",
      phone: "+509 3456-7891",
      email: "jean.baptiste@lncp.edu.ht",
      address: "Bureau 102, Administration",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    },
    {
      id: 3,
      name: "Mme. Sophie Laurent",
      role: "Secrétaire Générale",
      phone: "+509 3456-7892",
      email: "sophie.laurent@lncp.edu.ht",
      address: "Bureau 103, Administration",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    },
    {
      id: 4,
      name: "M. Pierre Moïse",
      role: "Responsable Financier",
      phone: "+509 3456-7893",
      email: "pierre.moise@lncp.edu.ht",
      address: "Bureau 104, Administration",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    },
    {
      id: 5,
      name: "Dr. Claudette Joseph",
      role: "Conseillère Pédagogique",
      phone: "+509 3456-7894",
      email: "claudette.joseph@lncp.edu.ht",
      address: "Bureau 105, Administration",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    },
    {
      id: 6,
      name: "M. Robert Michel",
      role: "Responsable Discipline",
      phone: "+509 3456-7895",
      email: "robert.michel@lncp.edu.ht",
      address: "Bureau 106, Administration",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    },
  ];

  const itemsPerPage: number = 1;
  const totalPages: number = staffMembers.length;

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, totalPages]);

  const nextSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
    setIsAutoPlaying(false);
  };

  const prevSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number): void => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section
      id="staff"
      className="min-h-screen bg-gray-50 text-dark flex flex-col justify-center items-center px-4 py-16"
    >
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-6 border border-secondary/20">
            <Users className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl font-bold text-secondary mb-4 font-['Kaushan_Script']">
            Notre Administration
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Découvrez l'équipe dévouée qui travaille pour assurer le succès de
            nos élèves.
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-300"
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-300"
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>

          {/* Carousel Content */}
          <div className="overflow-hidden mx-8">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {staffMembers.map((member) => (
                <div key={member.id} className="w-full flex-shrink-0 px-2">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section */}
                      <div className="w-full md:w-1/3 relative">
                        <div className="aspect-square relative">
                          <img
                            src={member.image}
                            alt={`Photo de ${member.name}`}
                            className="w-full h-full object-cover"
                            onError={(
                              e: React.SyntheticEvent<HTMLImageElement, Event>
                            ) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const nextSibling =
                                target.nextSibling as HTMLDivElement;
                              nextSibling.style.display = "flex";
                            }}
                          />
                          <div
                            className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
                            style={{ display: "none" }}
                          >
                            <User size={48} className="text-gray-300" />
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="w-full md:w-2/3 p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          {member.name}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                          {member.role}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone size={16} className="mr-2 text-gray-400" />
                            <span>{member.phone}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail size={16} className="mr-2 text-gray-400" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin size={16} className="mr-2 text-gray-400" />
                            <span>{member.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {staffMembers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-gray-800 w-4"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                aria-label={`Aller à la page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Staff;
