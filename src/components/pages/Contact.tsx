import React from 'react';

const Contact = () => {
    return (
        <section id="contact" className="bg-primary text-dark min-h-[calc(100vh-64px)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-secondary mb-8 text-center">Nous Contacter</h1>
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <form>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-dark font-semibold mb-2">Nom Complet</label>
                                <input type="text" id="name" name="name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-dark font-semibold mb-2">Adresse E-mail</label>
                                <input type="email" id="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="message" className="block text-dark font-semibold mb-2">Message</label>
                                <textarea id="message" name="message" rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary" required></textarea>
                            </div>
                            <div className="text-center">
                                <button type="submit" className="bg-secondary text-primary font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                                    Envoyer le Message
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-dark">Adresse</h3>
                            <p className="text-dark/80 mt-2">Rue de l'Avenir, #123<br/>Saint-Raphaël, Haïti</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-dark">Téléphone</h3>
                            <p className="text-dark/80 mt-2">(509) 1234-5678</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-dark">Email</h3>
                            <p className="text-dark/80 mt-2">contact@lncp.edu.ht</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
