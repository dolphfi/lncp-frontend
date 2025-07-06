import React from "react";
import {
  Target,
  Users,
  Award,
} from "lucide-react";

const About: React.FC = () => {
  return (
    <div
      id="about"
      className="bg-white text-dark min-h-[calc(100vh-64px)] relative"
    >
      <div className="px-6 md:px-16 lg:px-32 pt-20 pb-16 md:pb-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-site-secondary mb-4 font-['Kaushan_Script']">
            À Propos du LNCP
          </h1>
          <p className="text-sm max-w-2xl mx-auto leading-relaxed">
            Découvrez l'établissement d'excellence qui forme la jeunesse
            haïtienne depuis sa fondation, situé au cœur de Saint-Raphaël.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="flex items-center mb-6 ">
            {/* <Heart className="w-6 h-6 text-site-secondary mr-3" /> */}
            <h2 className="text-xl font-medium text-site-secondary font-['Kaushan_Script'] ">
              Notre Mission
            </h2>
          </div>
          <p className="text-sm leading-6 mb-6">
            Le Lycée National Charlemagne Péralte (LNCP) se consacre à la
            formation académique et citoyenne de la jeunesse haïtienne. Notre
            mission est de fournir une éducation de qualité, ancrée dans des
            valeurs de rigueur, de discipline et d'intégrité.
          </p>
          <p className="text-sm leading-6">
            Nous préparons nos élèves à devenir les leaders de demain dans un
            environnement d'apprentissage stimulant qui encourage la curiosité
            intellectuelle et le développement personnel.
          </p>
        </div>

        {/* Values Grid */}
        {/* <div className="mb-16">
          <div className="flex items-center mb-8">
            <Award className="w-6 h-6 text-site-secondary mr-3" />
            <h2 className="text-xl font-medium text-site-secondary">Nos Valeurs</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-site-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-site-secondary" />
              </div>
              <h3 className="font-medium text-sm mb-2">Excellence</h3>
              <p className="text-xs text-gray-600">
                Viser l'excellence dans tous les aspects de l'éducation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-site-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-site-secondary" />
              </div>
              <h3 className="font-medium text-sm mb-2">Intégrité</h3>
              <p className="text-xs text-gray-600">
                Agir avec honnêteté et transparence en toutes circonstances
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-site-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-site-secondary" />
              </div>
              <h3 className="font-medium text-sm mb-2">Respect</h3>
              <p className="text-xs text-gray-600">
                Cultiver le respect mutuel et la diversité culturelle
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-site-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-site-secondary" />
              </div>
              <h3 className="font-medium text-sm mb-2">Innovation</h3>
              <p className="text-xs text-gray-600">
                Adopter des méthodes pédagogiques modernes et innovantes
              </p>
            </div>
          </div>
        </div> */}

        {/* Vision Section */}
        {/* <div className="mb-16">
          <div className="flex items-center mb-6">
            <Target className="w-6 h-6 text-site-secondary mr-3" />
            <h2 className="text-2xl font-bold text-site-secondary">Notre Vision</h2>
          </div>
          <p className="text-lg leading-relaxed">
            Être reconnu comme un établissement d'excellence qui forme des
            générations de citoyens responsables et éclairés, contribuant au
            développement de leur communauté et de leur pays.
          </p>
        </div> */}

        {/* Engagement Section */}
        {/* <div className="mb-16">
          <div className="flex items-center mb-6">
            <GraduationCap className="w-6 h-6 text-site-secondary mr-3" />
            <h2 className="text-2xl font-bold text-site-secondary">
              Notre Engagement
            </h2>
          </div>
          <p className="text-lg leading-relaxed">
            Avec un corps professoral dévoué et des programmes académiques
            solides, le LNCP s'engage à perpétuer un héritage d'excellence et à
            former des générations de citoyens responsables et éclairés qui
            contribueront au développement d'Haïti.
          </p>
        </div> */}

        {/* Stats */}
        <div className="border-t border-gray-200 pt-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-site-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-site-secondary" />
              </div>
              <h3 className="font-medium text-sm text-black mb-2">
                Excellence
              </h3>
              <p className="text-xs text-gray-600">Depuis notre fondation</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-site-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-site-secondary" />
              </div>
              <h3 className="font-medium text-sm text-black mb-2">
                Communauté
              </h3>
              <p className="text-xs text-gray-600">
                Élèves & Professeurs dévoués
              </p>
            </div>

            <div>
              <div className="w-12 h-12 bg-site-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-site-secondary" />
              </div>
              <h3 className="font-medium text-sm text-black mb-2">Mission</h3>
              <p className="text-xs text-gray-600">
                Former les leaders de demain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
