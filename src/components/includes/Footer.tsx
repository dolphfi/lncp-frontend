import React from "react";
import { Link } from "react-scroll";

const Footer = () => {
  return (
    <footer className="border-t border-site-primary/80 bg-blue-900 text-site-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-site-secondary">LNCP</h2>
            <p className="text-xs text-site-primary/80">
              L'excellence en éducation, un héritage à perpétuer.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Liens Rapides</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="home"
                  spy={true}
                  smooth={true}
                  offset={-64}
                  duration={500}
                  className="hover:text-site-secondary transition-colors cursor-pointer text-xs"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="about"
                  spy={true}
                  smooth={true}
                  offset={-64}
                  duration={500}
                  className="hover:text-site-secondary transition-colors cursor-pointer text-xs"
                >
                  À Propos
                </Link>
              </li>
              <li>
                <Link
                  to="admissions"
                  spy={true}
                  smooth={true}
                  offset={-64}
                  duration={500}
                  className="hover:text-site-secondary transition-colors cursor-pointer text-xs"
                >
                  Admissions
                </Link>
              </li>
              <li>
                <Link
                  to="contact"
                  spy={true}
                  smooth={true}
                  offset={-64}
                  duration={500}
                  className="hover:text-site-secondary transition-colors cursor-pointer text-xs"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium">Suivez-nous</h3>
            <div className="flex mt-4 space-x-4">
              <button
                type="button"
                title="Facebook"
                className="text-site-primary/80 hover:text-site-secondary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </button>
              <button
                type="button"
                title="Twitter"
                className="text-site-primary/80 hover:text-site-secondary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 2.8 3.2 3 5.2-1.4 1.1-3.5 2.3-5.5 3.1-.6 2.5-2.2 4.8-4.5 6.2-2.3 1.4-5.2 2-8.5 1.4-2.1-.4-4.1-1.4-5.5-3.1-.9-1.1-1.5-2.4-1.5-4 0-3.3 2.7-6 6-6 1.2 0 2.3.4 3.2 1.1.9-.7 2.1-1.1 3.3-1.1 1.6 0 3 1.3 3 3 0 .6-.2 1.2-.5 1.7.9-1.2 2.1-2.1 3.5-2.6z" />
                </svg>
              </button>
              <button
                type="button"
                title="Instagram"
                className="text-site-primary/80 hover:text-site-secondary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-site-primary/20 text-center text-xs text-site-primary/60">
          <p>
            &copy; {new Date().getFullYear()} Lycée National Charlemagne
            Péralte. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
