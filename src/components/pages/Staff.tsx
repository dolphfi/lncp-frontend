import React from 'react';

const Staff = () => {
    return (
        <section id="staff" className="min-h-screen bg-primary text-dark flex flex-col justify-center items-center p-8">
            <div className="max-w-4xl text-center">
                <h2 className="text-4xl font-bold text-secondary mb-6">Notre Administration</h2>
                <p className="text-lg mb-8">
                    Découvrez l'équipe dévouée qui travaille sans relâche pour assurer le succès de nos élèves et le bon fonctionnement du Lycée National Charlemagne Péralte.
                </p>
                {/* Placeholder for staff members */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Example Staff Member */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4"></div>
                        <h3 className="text-xl font-bold text-secondary">Nom du Membre</h3>
                        <p className="text-dark">Poste / Rôle</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4"></div>
                        <h3 className="text-xl font-bold text-secondary">Nom du Membre</h3>
                        <p className="text-dark">Poste / Rôle</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4"></div>
                        <h3 className="text-xl font-bold text-secondary">Nom du Membre</h3>
                        <p className="text-dark">Poste / Rôle</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Staff;
