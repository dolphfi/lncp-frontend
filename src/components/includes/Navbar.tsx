import React, { useState } from 'react';
import { Link } from 'react-scroll';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="bg-primary shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="home" spy={true} smooth={true} offset={-64} duration={500} className="text-secondary font-bold text-2xl cursor-pointer">LNCP</Link>
                    </div>
                    <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-baseline space-x-4">
                            <Link to="home" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Accueil</Link>
                            <Link to="about" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">À Propos</Link>
                            <Link to="programs" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Programmes</Link>
                            <Link to="admissions" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Admissions</Link>
                            <Link to="contact" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Contact</Link>
                        </div>
                    </div>

                    {/* Right-side Buttons */}
                    <div className="hidden md:flex items-center">
                        <a href="#" className="flex items-center bg-secondary text-primary font-bold text-sm py-1 px-3 rounded-l-md hover:bg-blue-700 transition-colors duration-300">
                            <span>Connecter</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                        <a href="#" className="flex items-center bg-teal-500 text-primary font-bold text-sm py-1 px-3 rounded-r-md hover:bg-teal-600 transition-colors duration-300">
                            <span>Résultats</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </a>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button onClick={toggleMenu} type="button" className="bg-primary inline-flex items-center justify-center p-2 rounded-md text-dark hover:text-secondary focus:outline-none" aria-controls="mobile-menu" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-primary`} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link to="home" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary block px-3 py-2 rounded-md text-base font-medium cursor-pointer" onClick={toggleMenu}>Accueil</Link>
                    <Link to="about" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary block px-3 py-2 rounded-md text-base font-medium cursor-pointer" onClick={toggleMenu}>À Propos</Link>
                    <Link to="programs" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary block px-3 py-2 rounded-md text-base font-medium cursor-pointer" onClick={toggleMenu}>Programmes</Link>
                    <Link to="admissions" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary block px-3 py-2 rounded-md text-base font-medium cursor-pointer" onClick={toggleMenu}>Admissions</Link>
                    <Link to="contact" spy={true} smooth={true} offset={-64} duration={500} className="text-dark hover:text-secondary block px-3 py-2 rounded-md text-base font-medium cursor-pointer" onClick={toggleMenu}>Contact</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
