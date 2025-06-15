import React, { useState } from "react";
import { BookOpen, Brain, Microscope, Award, Download } from "lucide-react";

interface Program {
  id: number;
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const programs: Program[] = [
  {
    id: 1,
    title: "Secondaire I",
    description:
      "Première année du cycle secondaire. Acquisition des bases fondamentales en mathématiques, français, sciences et langues vivantes.",
    color: "from-blue-500/90 to-blue-600/90",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "Secondaire II",
    description:
      "Deuxième année du cycle secondaire. Approfondissement des connaissances et préparation aux études supérieures.",
    color: "from-purple-500/90 to-purple-600/90",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "Secondaire III",
    description:
      "Troisième année du cycle secondaire. Spécialisation en philosophie et sciences humaines pour développer la pensée critique.",
    color: "from-emerald-500/90 to-emerald-600/90",
    icon: <Microscope className="w-5 h-5" />,
  },
  {
    id: 4,
    title: "Secondaire IV",
    description:
      "Quatrième année du cycle secondaire. Préparation intensive au baccalauréat avec un focus sur les matières principales.",
    color: "from-amber-500/90 to-amber-600/90",
    icon: <Award className="w-5 h-5" />,
  },
];

const Programs = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    return (
    <section
      id="programs"
      className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-blue-900"
      style={{
        backgroundImage: 'url("/school.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Decorative overlays */}
      <div className="absolute top-0 left-0 right-0 w-full z-20">
        <img
          src="/overlay-top.png"
          alt="Paper decoration"
          className="w-full object-cover"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 w-full z-20">
        <img
          src="/overlay-bottom.png"
          alt="Paper decoration"
          className="w-full object-cover"
        />
      </div>
      {/* Dark overlay for better contrast */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-slate-900/85"></div> */}

      <div className="z-20 px-6 md:px-16 lg:px-32 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-lg rounded-full mb-6 border border-white/20">
            <Award className="w-8 h-8 text-yellow-400" />
                    </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-['Kaushan_Script'] drop-shadow-2xl">
            Nos Programmes
          </h1>
          <p className="text-sm text-white/90 max-w-2xl mx-auto leading-relaxed">
            Une formation d'excellence et un accompagnement personnalisé pour
            préparer l'avenir de nos élèves. Téléchargez le programme officiel
            du Ministère de l'Éducation Nationale.
          </p>
                    </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {programs.map((program, index) => (
            <div
              key={program.id}
              className={`group relative transition-all duration-500 ${
                hoveredCard === program.id
                  ? "z-30"
                  : hoveredCard !== null
                  ? "opacity-80"
                  : ""
              }`}
              onMouseEnter={() => setHoveredCard(program.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Card Container */}
              <div className="relative h-full bg-white/5 rounded-2xl border border-white/20 overflow-hidden shadow-xl">
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                ></div>

                {/* Content */}
                <div className="relative p-6 h-full flex flex-col">
                  {/* Header */}
                  {/* <div className="flex items-center mb-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 bg-gradient-to-br ${program.color.replace(
                        "/90",
                        "/100"
                      )} rounded-xl text-white shadow-lg transition-transform duration-300`}
                    >
                      {program.icon}
                    </div>
                  </div> */}

                  {/* Title */}
                  <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                    {program.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/90 leading-6 text-xs flex-grow">
                    {program.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    className={`w-full mt-4 py-3 px-4 bg-gradient-to-r ${program.color.replace(
                      "/90",
                      "/100"
                    )} text-white rounded-full transform transition-all duration-300 hover:shadow-xl hover:shadow-black/25 group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 border border-white/20 text-xs flex items-center justify-center gap-2`}
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>

                {/* Decorative Elements */}
                <div
                  className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${program.color.replace(
                    "/90",
                    "/20"
                  )} rounded-full blur-xl group-hover:blur-2xl transition-all duration-500`}
                ></div>
                <div
                  className={`absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-tr ${program.color.replace(
                    "/90",
                    "/15"
                  )} rounded-full blur-lg group-hover:blur-xl transition-all duration-500`}
                ></div>
              </div>

              {/* Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${program.color.replace(
                  "/90",
                  "/30"
                )} opacity-0 group-hover:opacity-100 blur-2xl rounded-3xl transition-opacity duration-500 -z-10`}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-300/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-purple-300/20 rounded-full animate-pulse delay-3000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-emerald-300/30 rounded-full animate-pulse delay-4000"></div>
            </div>
        </section>
    );
};

export default Programs;
