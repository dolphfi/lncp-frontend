import React from 'react';

const Home = () => {
    return (
        <main>
            <section id="home" className="flex items-center justify-center h-[calc(100vh-64px)] text-center bg-primary">
                <div className="relative z-10 p-4 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 text-dark">Bienvenue au LNCP</h1>
                    <p className="text-lg md:text-xl text-secondary font-semibold mb-8">Lycée National Charlemagne Péralte</p>
                    <a href="/admissions" className="bg-secondary text-primary font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-transform transform hover:scale-105">Nos Admissions</a>
                </div>
            </section>
        </main>
    );
};

export default Home;
