import React from 'react';

const Admissions = () => {
    return (
        <section id="admissions" className="bg-primary text-dark min-h-[calc(100vh-64px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-secondary mb-6">Processus d'Admission</h1>
                <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-dark mb-2">Conditions Requises</h3>
                        <ul className="list-disc list-inside text-dark/80 space-y-2">
                            <li>Dossier scolaire complet des années précédentes.</li>
                            <li>Lettre de recommandation d'un ancien professeur.</li>
                            <li>Examen d'entrée en mathématiques et en français.</li>
                            <li>Entretien avec le comité d'admission.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-dark mb-2">Dates Importantes</h3>
                        <p className="text-dark/80">La période d'inscription pour l'année scolaire 2024-2025 est ouverte du 1er juin au 31 juillet. Les examens d'entrée auront lieu le 15 août.</p>
                    </div>
                    <div className="text-center">
                        <button className="bg-secondary text-primary font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                            Télécharger le Formulaire d'Inscription
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Admissions;
