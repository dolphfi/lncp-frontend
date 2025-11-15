/**
 * =====================================================
 * UTILITAIRE GÉNÉRATION PDF BULLETINS
 * =====================================================
 * Génération de bulletins scolaires en PDF avec jsPDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportCard } from '../types/reportCard';

// Déclaration des types pour jsPDF avec autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Options pour la génération du PDF
 */
interface PDFGenerationOptions {
  headerImagePath?: string;
  watermarkImagePath?: string;
  schoolName?: string;
  academicYear?: string;
}

/**
 * Génère un bulletin scolaire en PDF
 * @param reportCard - Données du bulletin
 * @param options - Options de génération
 */
export const generateReportCardPDF = async (
  reportCard: ReportCard,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  // Génération de l'année académique par défaut au format "2024-2025"
  const currentYear = new Date().getFullYear();
  const defaultAcademicYear = `${currentYear - 1}-${currentYear}`;
  
  const {
    headerImagePath = '/img/header.png',
    watermarkImagePath = '/img/filig.png',
    schoolName = 'École',
    academicYear = defaultAcademicYear
  } = options;

  try {
    const doc = new jsPDF('p', 'pt', 'letter'); // Format lettre (8.5 x 11 pouces)

    // Ajouter l'image de fond (filigrane) - DÉSACTIVÉ
    // await addWatermark(doc, watermarkImagePath);

    // Ajouter l'en-tête
    await addHeader(doc, headerImagePath);

    // Ajouter les informations de l'étudiant
    addStudentInfo(doc, reportCard, academicYear);

    // Ajouter le tableau des notes
    addGradesTable(doc, reportCard);

    // Tableaux intervalles et légende retirés
    // addIntervalsTable(doc);
    // addNotesLegend(doc);

    // Ajouter les moyennes générales (au même niveau que le tableau des notes)
    addGeneralAveragesTable(doc, reportCard);

    // Ajouter la section décision
    addDecisionSection(doc, reportCard);

    // Ajouter les lignes de signature
    addSignatures(doc);

    // Sauvegarder le PDF
    const fileName = `bulletin_${reportCard.studentInfo.matricule}_${reportCard.studentInfo.firstName}_${reportCard.studentInfo.lastName}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    console.error('Détails:', error);
    throw error; // Relancer l'erreur originale pour voir le détail
  }
};

/**
 * Ajoute le filigrane de fond
 */
const addWatermark = async (doc: jsPDF, imagePath: string): Promise<void> => {
  try {
    const img = new Image();
    img.src = imagePath;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => resolve(null); // Continue même si l'image n'existe pas
    });

    // Créer un canvas avec l'image
    const canvas = document.createElement('canvas');
    canvas.width = 612; // Largeur lettre en points
    canvas.height = 792; // Hauteur lettre en points
    const context = canvas.getContext('2d');
    
    if (context && img.complete) {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 612, 792);
    }
  } catch (error) {
    console.warn('Filigrane non chargé, continuation sans filigrane');
  }
};

/**
 * Ajoute l'en-tête avec logo
 */
const addHeader = async (doc: jsPDF, imagePath: string): Promise<void> => {
  try {
    const img = new Image();
    img.src = imagePath;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => resolve(null);
    });

    if (img.complete) {
      doc.addImage(imagePath, 'PNG', 0, 0, 612, 80); // Hauteur réduite de 130 à 80
    }
  } catch (error) {
    console.warn('En-tête non chargée, continuation sans en-tête');
  }
};

/**
 * Ajoute les informations de l'étudiant
 */
const addStudentInfo = (doc: jsPDF, reportCard: ReportCard, academicYear: string): void => {
  const { studentInfo } = reportCard;

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  
  // Colonne gauche
  doc.text(`Nom : ${studentInfo.lastName.toUpperCase()}`, 40, 100);
  doc.text(`Prénom : ${studentInfo.firstName}`, 40, 120);
  doc.text(`Année Académique : ${academicYear}`, 200, 145);
  
  // Colonne droite
  doc.text(`Matricule : ${studentInfo.matricule}`, 350, 100);
  doc.text(`Classe : ${studentInfo.classRoom}`, 350, 120);
};

/**
 * Ajoute le tableau des notes par trimestre
 */
const addGradesTable = (doc: jsPDF, reportCard: ReportCard): void => {
  const { grades } = reportCard;

  // En-têtes du tableau
  const tableColumn = ['Matières', 'Max', 'Contrôle 1', 'Contrôle 2', 'Contrôle 3'];

  // Construire les lignes de notes
  const tableRows: any[] = [];

  // Obtenir tous les cours (union des 3 trimestres)
  const allCourses = new Map<string, any>();

  grades.trimestre1.forEach(grade => {
    if (!allCourses.has(grade.courseCode)) {
      allCourses.set(grade.courseCode, {
        courseTitre: grade.courseTitre,
        ponderation: Number(grade.ponderation),
        t1: grade.note !== null ? Number(grade.note) : null,
        t2: null,
        t3: null
      });
    }
  });

  grades.trimestre2.forEach(grade => {
    if (allCourses.has(grade.courseCode)) {
      allCourses.get(grade.courseCode).t2 = grade.note !== null ? Number(grade.note) : null;
    } else {
      allCourses.set(grade.courseCode, {
        courseTitre: grade.courseTitre,
        ponderation: Number(grade.ponderation),
        t1: null,
        t2: grade.note !== null ? Number(grade.note) : null,
        t3: null
      });
    }
  });

  grades.trimestre3.forEach(grade => {
    if (allCourses.has(grade.courseCode)) {
      allCourses.get(grade.courseCode).t3 = grade.note !== null ? Number(grade.note) : null;
    } else {
      allCourses.set(grade.courseCode, {
        courseTitre: grade.courseTitre,
        ponderation: Number(grade.ponderation),
        t1: null,
        t2: null,
        t3: grade.note !== null ? Number(grade.note) : null
      });
    }
  });

  // Remplir les lignes
  allCourses.forEach((course) => {
    tableRows.push([
      course.courseTitre,
      course.ponderation,
      course.t1 !== null ? course.t1.toFixed(2) : '-',
      course.t2 !== null ? course.t2.toFixed(2) : '-',
      course.t3 !== null ? course.t3.toFixed(2) : '-'
    ]);
  });

  // Ligne de séparation grise
  tableRows.push([{
    content: '',
    colSpan: 5,
    styles: { fillColor: [200, 200, 200], fontSize: 5, lineWidth: 0 }
  }]);

  // Calculer le total des pondérations
  const totalPonderation = Array.from(allCourses.values())
    .reduce((sum, course) => sum + (course.ponderation || 0), 0);

  // Ligne Total
  tableRows.push([
    { content: 'Total', styles: { halign: 'right', fontStyle: 'bold', cellPadding: { right: 5 } } },
    { content: totalPonderation.toString(), styles: { fontStyle: 'bold' } },
    { content: Number(grades.sumOfNotes1).toFixed(2), styles: { fontStyle: 'bold' } },
    { content: Number(grades.sumOfNotes2).toFixed(2), styles: { fontStyle: 'bold' } },
    { content: Number(grades.sumOfNotes3).toFixed(2), styles: { fontStyle: 'bold' } }
  ]);

  // Ligne Sur (pondération totale)
  tableRows.push([
    { content: 'Sur', styles: { halign: 'right', fontStyle: 'bold', cellPadding: { right: 5 } } },
    { content: '-', styles: { fontStyle: 'bold' } },
    { content: grades.ponderationTrimestre1 || '-', styles: { fontStyle: 'bold' } },
    { content: grades.ponderationTrimestre2 || '-', styles: { fontStyle: 'bold' } },
    { content: grades.ponderationTrimestre3 || '-', styles: { fontStyle: 'bold' } }
  ]);

  // Ligne Moyenne
  tableRows.push([
    { content: 'Moyenne', styles: { halign: 'right', fontStyle: 'bold', cellPadding: { right: 5 } } },
    { content: '10', styles: { fontStyle: 'bold' } },
    { content: Number(grades.moyenneTrimestre1).toFixed(2), styles: { fontStyle: 'bold' } },
    { content: Number(grades.moyenneTrimestre2).toFixed(2), styles: { fontStyle: 'bold' } },
    { content: Number(grades.moyenneTrimestre3).toFixed(2), styles: { fontStyle: 'bold' } }
  ]);

  // Générer le tableau
  autoTable(doc, {
    startY: 160,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 12,
      cellPadding: 2
    },
    headStyles: {
      halign: 'center',
      valign: 'middle',
      fillColor: [25, 55, 109], // Bleu marine
      textColor: [255, 255, 255]
    },
    bodyStyles: { textColor: [22, 22, 22] },
    margin: { right: 220 }, // Laisser l'espace à droite pour les autres tableaux
    tableWidth: 360 // Limiter la largeur du tableau des notes
  });
};

/**
 * Ajoute le tableau des intervalles/appréciations
 */
const addIntervalsTable = (doc: jsPDF): void => {
  const intervalTableColumn = ['Intervalle', 'Niveau', 'Appréciations'];
  const intervalTableRows = [
    ['100-90', '5', 'T-D'],
    ['89-70', '4', 'D'],
    ['69-50', '3', 'P.'],
    ['54-30', '2', 'P-D'],
    ['Moins de 30', '1', 'TPD']
  ];

  autoTable(doc, {
    startY: 200,
    head: [intervalTableColumn],
    body: intervalTableRows,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10,
      cellPadding: 1
    },
    headStyles: {
      fillColor: [25, 55, 109], // Bleu marine
      fontStyle: 'bold',
      textColor: [255, 255, 255]
    },
    bodyStyles: { textColor: [22, 22, 22] },
    margin: { left: 395 }
  });
};

/**
 * Ajoute le tableau des moyennes générales
 */
const addGeneralAveragesTable = (doc: jsPDF, reportCard: ReportCard): void => {
  const { grades, moyenneGenerale, decision } = reportCard;

  const moyenneGTableColumn = ['Moyenne Générale', ''];
  const moyenneGTableRows = [
    ['1er Contrôle', Number(grades.moyenneTrimestre1).toFixed(2)],
    ['2e Contrôle', Number(grades.moyenneTrimestre2).toFixed(2)],
    ['3e Contrôle', Number(grades.moyenneTrimestre3).toFixed(2)],
    ['Moyenne de l\'année', Number(moyenneGenerale).toFixed(2)],
    ['Décision de l\'année', decision || '-']
  ];

  autoTable(doc, {
    startY: 160, // Même niveau que le tableau des notes
    head: [moyenneGTableColumn],
    body: moyenneGTableRows,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10,
      cellPadding: 1
    },
    headStyles: {
      halign: 'center',
      valign: 'middle',
      fontStyle: 'bold',
      fillColor: [25, 55, 109], // Bleu marine
      textColor: [255, 255, 255]
    },
    bodyStyles: { textColor: [22, 22, 22] },
    margin: { left: 405, right: 40 }, // Positionner à droite
    tableWidth: 180 // Largeur fixe pour le tableau
  });
};

/**
 * Ajoute la légende des notes
 */
const addNotesLegend = (doc: jsPDF): void => {
  const notesTableColumn1 = ['Valeurs des Notes'];

  autoTable(doc, {
    startY: 373,
    head: [notesTableColumn1],
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10,
      cellPadding: 1
    },
    headStyles: {
      halign: 'center',
      valign: 'middle',
      fontStyle: 'bold',
      fillColor: [25, 55, 109], // Bleu marine
      textColor: [255, 255, 255]
    },
    margin: { left: 395 }
  });

  const notesTableRows = [
    ['T-D', 'Très Développé', 'D', 'Développé'],
    ['P.', 'Passable', 'P-D', 'Peu Développé'],
    ['TPD', 'Très Peu Développé', '', '']
  ];

  autoTable(doc, {
    startY: 386,
    body: notesTableRows,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10,
      cellPadding: 1
    },
    bodyStyles: { textColor: [22, 22, 22] },
    margin: { left: 395 }
  });
};

/**
 * Ajoute la section décision de l'année avec cases à cocher
 */
const addDecisionSection = (doc: jsPDF, reportCard: ReportCard): void => {
  // Calculer la position après le tableau des moyennes
  const finalY = (doc as any).lastAutoTable?.finalY || 360;
  
  autoTable(doc, {
    startY: finalY + 20, // 20pt après le tableau des moyennes
    head: [['Décision de l\'année']],
    body: [
      ['Promu(e)', ''],
      ['Promu(e) Ailleurs', ''],
      ['Doublé Ailleurs', '']
    ],
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10,
      cellPadding: 1
    },
    headStyles: {
      halign: 'center',
      valign: 'middle',
      fillColor: [25, 55, 109], // Bleu marine
      textColor: [255, 255, 255]
    },
    bodyStyles: { textColor: [22, 22, 22] },
    margin: { left: 405, right: 40 }, // Positionner à droite
    tableWidth: 180 // Largeur fixe pour le tableau
  });

  // Dessiner les cases à cocher (positions relatives au tableau)
  const tableY = (doc as any).lastAutoTable?.finalY || finalY;
  const checkBoxX = 540;
  const checkBoxStartY = finalY + 35; // Position de départ relative
  
  // Dessiner 3 cases à cocher
  for (let i = 0; i < 3; i++) {
    doc.rect(checkBoxX, checkBoxStartY + (i * 13), 10, 10);
  }
};

/**
 * Ajoute les lignes de signature
 */
const addSignatures = (doc: jsPDF): void => {
  // Position dynamique après le dernier tableau
  const finalY = (doc as any).lastAutoTable?.finalY || 500;
  const yPos1 = finalY + 60; // 60pt après le dernier tableau

  doc.setLineWidth(0.5);
  doc.line(400, yPos1, 560, yPos1);

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text('Signature du Directeur', 440, yPos1 + 15);
};

/**
 * Génère un bulletin pour une classe complète (PDF multi-pages)
 */
export const generateClassroomReportCardsPDF = async (
  reportCards: ReportCard[],
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const doc = new jsPDF('p', 'pt', 'letter');

  for (let i = 0; i < reportCards.length; i++) {
    if (i > 0) {
      doc.addPage();
    }

    // Générer chaque bulletin individuellement
    await generateSinglePageReportCard(doc, reportCards[i], options);
  }

  const fileName = `bulletins_classe_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

/**
 * Génère un bulletin sur une page existante du PDF
 */
const generateSinglePageReportCard = async (
  doc: jsPDF,
  reportCard: ReportCard,
  options: PDFGenerationOptions
): Promise<void> => {
  const {
    headerImagePath = '/img/header.png',
    watermarkImagePath = '/img/filig.png',
    academicYear = new Date().getFullYear().toString()
  } = options;

  await addWatermark(doc, watermarkImagePath);
  await addHeader(doc, headerImagePath);
  addStudentInfo(doc, reportCard, academicYear);
  addGradesTable(doc, reportCard);
  addIntervalsTable(doc);
  addGeneralAveragesTable(doc, reportCard);
  addNotesLegend(doc);
  addDecisionSection(doc, reportCard);
  addSignatures(doc);
};
