import React from 'react';

const About = () => {
    return (
        <div id="about" className="bg-primary text-dark min-h-[calc(100vh-64px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-secondary mb-6">À Propos du LNCP</h1>
                <div className="space-y-6">
                    <p className="text-lg leading-relaxed">
                        Le Lycée National Charlemagne Péralte (LNCP), situé au cœur de Saint-Raphaël, est un établissement d'excellence qui se consacre à la formation académique et citoyenne de la jeunesse haïtienne depuis sa fondation.
                    </p>
                    <p className="text-lg leading-relaxed">
                        Notre mission est de fournir une éducation de qualité, ancrée dans des valeurs de rigueur, de discipline et d'intégrité, tout en préparant nos élèves à devenir les leaders de demain. Nous offrons un environnement d'apprentissage stimulant qui encourage la curiosité intellectuelle et le développement personnel.
                    </p>
                    <p className="text-lg leading-relaxed">
                        Avec un corps professoral dévoué et des programmes académiques solides, le LNCP s'engage à perpétuer un héritage d'excellence et à former des générations de citoyens responsables et éclairés.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
