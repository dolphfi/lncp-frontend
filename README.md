# 🎓 LNC Digital – Interface Web (Frontend)

Interface web moderne et sécurisée pour la transformation digitale du Lycée National Charlemagne Péralte.  
Ce projet fait partie du projet de fin d'études (PFE) de CODE CONQUERORS, visant à optimiser la gestion administrative à travers une application intuitive, performante et responsive.

---

## 🚀 Fonctionnalités principales

- 🔐 Authentification sécurisée
- 👨‍🎓 Gestion des élèves, enseignants et classes
- 📊 Statistiques et rapports dynamiques
- 🧾 Gestion des paiements et bulletins
- 📥 Export PDF / Excel
- 🔄 Synchronisation avec le backend NestJS
- 📱 Responsive et mobile-firs
- etc...

---

## 🛠️ Stack Technique

| Outil / Lib         | Rôle |
|---------------------|------|
| **React 19**        | Framework frontend |
| **TypeScript**      | Typage statique robuste |
| **shadcn/ui**       | Composants UI élégants et accessibles |
| **Tailwind CSS**    | Style rapide, responsive et personnalisable |
| **React Router DOM**| Routing côté client |
| **Context API** ou **Zustand** | Gestion d’état globale |
| **fetch**           | Requêtes HTTP vers le backend NestJS |
| **ESLint + Prettier** | Linting et formatage du code |

---

## 📁 Structure du projet
- src/
    - components/
        - auth/
        - context/
        - data/
        - errors/
        - includes/
        - jobs/
        - pages/
          - others/
          - dashboard/
        - public/
        - routes/
        - utils/

---

## ⚙️ Installation

```bash
# Clonez le repo
git clone https://github.com/dolphfi/lncp-frontend.git
cd lncp-frontend

# Installez les dépendances
npm install

# Lancez le serveur local
npm start
```

📌 Auteur

🖥️ Développé par CODE CONQUERORS
    - Rodolph Phayendy Delon Fidèle
        ✉️ rodolphfidele@gmail.com
    - Wislin Herntz PROPHETE
        ✉️ prophetewislinherntz@gmail.com
    - Witchy JEAN
        ✉️ jeanwitchy97@gmail.com
Étudiant en Licence Faculte des Sciences Informatique
Université ROI HENRI CHRISTOPHE [URHC]
Rue 18 H-I, Cap-Haïtien, Haïti

🛡️ Sécurité & Confidentialité
    - Toutes les communications sont sécurisées via HTTPS
    - Accès basé sur les rôles
    - Aucune donnée sensible n’est stockée côté frontend