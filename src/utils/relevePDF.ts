/**
 * =====================================================
 * GÉNÉRATION PDF RELEVÉ DE NOTES ARCHIVÉ
 * =====================================================
 * Génère un relevé de notes pour un étudiant archivé
 * Copie exacte du bulletin avec "RELEVÉ DE NOTES" comme titre
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
 * Structure des données du relevé (adapté depuis le bulletin archivé)
 */
interface ReleveGrades {
  trimestre1: Array<{
    courseCode: string;
    courseTitre: string;
    note: number | null;
    ponderation: number;
  }>;
  trimestre2: Array<{
    courseCode: string;
    courseTitre: string;
    note: number | null;
    ponderation: number;
  }>;
  trimestre3: Array<{
    courseCode: string;
    courseTitre: string;
    note: number | null;
    ponderation: number;
  }>;
  sumOfNotes1: number;
  sumOfNotes2: number;
  sumOfNotes3: number;
  ponderationTrimestre1: number;
  ponderationTrimestre2: number;
  ponderationTrimestre3: number;
  moyenneTrimestre1: number;
  moyenneTrimestre2: number;
  moyenneTrimestre3: number;
}

interface ReleveData {
  studentInfo: {
    matricule: string;
    firstName: string;
    lastName: string;
    classRoom: string;
  };
  grades: ReleveGrades;
  moyenneGenerale: number;
  decision: string;
  academicYear: string;
}

/**
 * Convertit les données archivées en format bulletin
 */
const convertArchivedDataToReportCard = (archivedData: any, academicYear: string): ReleveData => {
  const { student } = archivedData;
  
  // Créer les tableaux de notes par trimestre
  const trimestre1: any[] = [];
  const trimestre2: any[] = [];
  const trimestre3: any[] = [];
  
  let sumOfNotes1 = 0;
  let sumOfNotes2 = 0;
  let sumOfNotes3 = 0;
  let totalPonderation = 0;
  
  // Parcourir les notes archivées
  student.notes.forEach((note: any) => {
    const ponderation = 200; // Valeur par défaut
    totalPonderation += ponderation;
    
    const t1 = note.trimestre_1 ? Number(note.trimestre_1) : null;
    const t2 = note.trimestre_2 ? Number(note.trimestre_2) : null;
    const t3 = note.trimestre_3 ? Number(note.trimestre_3) : null;
    
    if (t1 !== null) sumOfNotes1 += t1;
    if (t2 !== null) sumOfNotes2 += t2;
    if (t3 !== null) sumOfNotes3 += t3;
    
    trimestre1.push({
      courseCode: note.courseCode,
      courseTitre: note.courseName,
      note: t1,
      ponderation: ponderation
    });
    
    trimestre2.push({
      courseCode: note.courseCode,
      courseTitre: note.courseName,
      note: t2,
      ponderation: ponderation
    });
    
    trimestre3.push({
      courseCode: note.courseCode,
      courseTitre: note.courseName,
      note: t3,
      ponderation: ponderation
    });
  });
  
  const moyenneTrimestre1 = student.notes.length > 0 ? sumOfNotes1 / student.notes.length : 0;
  const moyenneTrimestre2 = student.notes.length > 0 ? sumOfNotes2 / student.notes.length : 0;
  const moyenneTrimestre3 = student.notes.length > 0 ? sumOfNotes3 / student.notes.length : 0;
  const moyenneGenerale = (moyenneTrimestre1 + moyenneTrimestre2 + moyenneTrimestre3) / 3;
  
  return {
    studentInfo: {
      matricule: student.matricule,
      firstName: student.firstName,
      lastName: student.lastName,
      classRoom: student.classroom.name
    },
    grades: {
      trimestre1,
      trimestre2,
      trimestre3,
      sumOfNotes1,
      sumOfNotes2,
      sumOfNotes3,
      ponderationTrimestre1: totalPonderation,
      ponderationTrimestre2: totalPonderation,
      ponderationTrimestre3: totalPonderation,
      moyenneTrimestre1,
      moyenneTrimestre2,
      moyenneTrimestre3
    },
    moyenneGenerale,
    decision: moyenneGenerale >= 60 ? 'Promu(e)' : 'Doublé',
    academicYear
  };
};

/**
 * Génère un relevé de notes en PDF
 * @param archivedData - Données archivées du relevé
 * @param options - Options de génération
 */
export const generateRelevePDF = async (
  archivedData: any,
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    headerImagePath = '/header-2.png',
    watermarkImagePath = '/paper.png',
    schoolName = 'LNCP',
    academicYear = archivedData.academicYear
  } = options;

  try {
    const doc = new jsPDF('p', 'pt', 'letter');
    
    // Convertir les données
    const releveData = convertArchivedDataToReportCard(archivedData, academicYear);

    // Ajouter l'en-tête
    await addHeader(doc, headerImagePath);

    // Ajouter le titre "RELEVÉ DE NOTES" (NOUVEAU)
    addReleveTitle(doc, academicYear);

    // Ajouter les informations de l'étudiant
    addStudentInfo(doc, releveData);

    // Ajouter le tableau des notes
    addGradesTable(doc, releveData);

    // Ajouter les moyennes générales
    addGeneralAveragesTable(doc, releveData);

    // Ajouter la section décision
    addDecisionSection(doc, releveData);

    // Ajouter les lignes de signature
    addSignatures(doc);

    // Sauvegarder le PDF
    const fileName = `releve_notes_${releveData.studentInfo.matricule}_${academicYear.replace('/', '-')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
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
      doc.addImage(imagePath, 'PNG', 0, 0, 612, 80);
    }
  } catch (error) {
    console.warn('En-tête non chargée, continuation sans en-tête');
  }
};

/**
 * Ajoute le titre "RELEVÉ DE NOTES" - NOUVELLE FONCTION
 */
const addReleveTitle = (doc: jsPDF, academicYear: string): void => {
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.setTextColor(25, 55, 109); // Bleu marine
  
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text('RELEVÉ DE NOTES', pageWidth / 2, 95, { align: 'center' });
};

/**
 * Ajoute les informations de l'étudiant
 */
const addStudentInfo = (doc: jsPDF, releveData: ReleveData): void => {
  const { studentInfo, academicYear } = releveData;

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  
  // Colonne gauche
  doc.text(`Nom : ${studentInfo.lastName.toUpperCase()}`, 40, 115);
  doc.text(`Prénom : ${studentInfo.firstName}`, 40, 135);
  doc.text(`Année Académique : ${academicYear}`, 200, 155);
  
  // Colonne droite
  doc.text(`Matricule : ${studentInfo.matricule}`, 350, 115);
  doc.text(`Classe : ${studentInfo.classRoom}`, 350, 135);
};

/**
 * Ajoute le tableau des notes par trimestre
 */
const addGradesTable = (doc: jsPDF, releveData: ReleveData): void => {
  const { grades } = releveData;

  const tableColumn = ['Matières', 'Max', 'Contrôle 1', 'Contrôle 2', 'Contrôle 3'];
  const tableRows: any[] = [];

  // Obtenir tous les cours
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

  // Ligne de séparation
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

  // Ligne Sur
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
    startY: 170,
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
      fillColor: [25, 55, 109],
      textColor: [255, 255, 255]
    },
    bodyStyles: { textColor: [22, 22, 22] },
    margin: { right: 220 },
    tableWidth: 360
  });
};

/**
 * Ajoute le tableau des moyennes générales
 */
const addGeneralAveragesTable = (doc: jsPDF, releveData: ReleveData): void => {
  const { grades, moyenneGenerale, decision } = releveData;

  const moyenneGTableColumn = ['Moyenne Générale', ''];
  const moyenneGTableRows = [
    ['1er Contrôle', Number(grades.moyenneTrimestre1).toFixed(2)],
    ['2e Contrôle', Number(grades.moyenneTrimestre2).toFixed(2)],
    ['3e Contrôle', Number(grades.moyenneTrimestre3).toFixed(2)],
    ['Moyenne de l\'année', Number(moyenneGenerale).toFixed(2)],
    ['Décision de l\'année', decision || '-']
  ];

  autoTable(doc, {
    startY: 170,
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
      fillColor: [25, 55, 109],
      textColor: [255, 255, 255]
    },
    bodyStyles: { textColor: [22, 22, 22] },
    margin: { left: 405, right: 40 },
    tableWidth: 180
  });
};

/**
 * Ajoute la section décision de l'année avec cases à cocher
 */
const addDecisionSection = (doc: jsPDF, releveData: ReleveData): void => {
  const finalY = (doc as any).lastAutoTable?.finalY || 360;
  
  autoTable(doc, {
    startY: finalY + 20,
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
      fillColor: [25, 55, 109],
      textColor: [255, 255, 255]
    },
    bodyStyles: { textColor: [22, 22, 22] },
    margin: { left: 405, right: 40 },
    tableWidth: 180
  });

  // Dessiner les cases à cocher
  const checkBoxX = 540;
  const checkBoxStartY = finalY + 35;
  
  for (let i = 0; i < 3; i++) {
    doc.rect(checkBoxX, checkBoxStartY + (i * 13), 10, 10);
  }
};

/**
 * Ajoute les lignes de signature
 */
const addSignatures = (doc: jsPDF): void => {
  const finalY = (doc as any).lastAutoTable?.finalY || 500;
  const yPos1 = finalY + 60;

  doc.setLineWidth(0.5);
  doc.line(400, yPos1, 560, yPos1);

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text('Signature du Directeur', 440, yPos1 + 15);
};
