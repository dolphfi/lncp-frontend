import React from 'react';

const Programs = () => {
    return (
        <section id="programs" className="bg-primary text-dark min-h-[calc(100vh-64px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-secondary mb-6">Nos Programmes</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Programme 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-dark mb-2">Secondaire I & II</h3>
                        <p className="text-dark/80">Un programme fondamental qui prépare les élèves aux défis du cycle secondaire supérieur avec une base solide en sciences, lettres et mathématiques.</p>
                    </div>
                    {/* Programme 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-dark mb-2">Secondaire III & IV (Philo)</h3>
                        <p className="text-dark/80">Spécialisation en philosophie, littérature et sciences humaines pour développer la pensée critique et la culture générale des futurs bacheliers.</p>
                    </div>
                    {/* Programme 3 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-dark mb-2">Sciences de la Vie et de la Terre</h3>
                        <p className="text-dark/80">Un cursus axé sur la biologie, la chimie et la géologie pour les élèves passionnés par les sciences et visant des carrières médicales ou scientifiques.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Programs;
