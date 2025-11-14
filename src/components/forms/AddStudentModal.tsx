import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, MapPin, User, Users, GraduationCap, Home, Search, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import { addStudentSchema } from '../../schemas/addStudentSchema';
import { studentsService, type Responsable, type AddStudentApiPayload } from '../../services/students/studentsService';
import { useClassroomStore } from '../../stores/classroomStore';
import { VACATION_OPTIONS, TEACHING_LEVEL_OPTIONS } from '../../schemas/studentSchema';
import ImageCrop from '../ui/image-crop';

// Utilisation directe du type généré par le schéma Zod

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  studentId?: string; // ID pour le mode édition
}

const FormField: React.FC<{ label: string; required?: boolean; error?: React.ReactNode; children: React.ReactNode }>=({label, required=false, error, children})=> (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default function AddStudentModal({ open, onOpenChange, onSuccess, studentId }: AddStudentModalProps) {
  const mode = studentId ? 'edit' : 'create';
  const { items: classrooms, fetchAll, getDetails } = useClassroomStore();
  const [rooms, setRooms] = useState<Array<{id: string; name: string}>>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [filteredResponsables, setFilteredResponsables] = useState<Responsable[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitError, setSubmitError] = useState<string|null>(null);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);

  // Nettoyer l'URL de prévisualisation quand le modal se ferme
  React.useEffect(() => {
    if (!open) {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      setAvatarFile(null);
    }
  }, [open, avatarPreview]);

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm({
    // Utiliser le nouveau schéma aligné avec l'API
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      avatar: undefined,
      placeOfBirth: '', communeDeNaissance: '', hasHandicap: false, handicapDetails: '',
      adresse: '', vacation: 'AM', niveauEnseignement: 'Secondaire', grade: 'NSI',
      nomMere: '', prenomMere: '', statutMere: 'vivant', occupationMere: '',
      nomPere: '', prenomPere: '', statutPere: 'vivant', occupationPere: '',
      responsableMode: 'create', personneResponsableId: '', responsable: { firstName: '', lastName: '', lienParente: '' },
      selectedClassroomId: '', roomId: 'none'
    }
  });

  const selectedClassroomId = watch('selectedClassroomId');
  const responsableMode = watch('responsableMode');

  // Mapping entre les niveaux de classe et les niveaux d'étude
  const getGradeFromClassLevel = (className?: string): string => {
    if (!className) return 'NSI';

    const name = className.toLowerCase().trim();
    console.log('DEBUG - Analyse du nom de classe:', `"${className}" -> "${name}"`);

    // Mapping basé sur les vrais noms de classe du backend
    if (name.includes('nsiii') || name.includes('ns iii') || name.includes('ns-iii') || name.includes('3') || name.includes('troisième') || name.includes('troisieme')) {
      console.log('DEBUG - Mapping trouvé: NSIII');
      return 'NSIII';
    } else if (name.includes('nsiv') || name.includes('ns iv') || name.includes('ns-iv') || name.includes('4') || name.includes('quatrième') || name.includes('quatrieme')) {
      console.log('DEBUG - Mapping trouvé: NSIV');
      return 'NSIV';
    } else if (name.includes('nsii') || name.includes('ns ii') || name.includes('ns-ii') || name.includes('2') || name.includes('deuxième') || name.includes('deuxieme')) {
      console.log('DEBUG - Mapping trouvé: NSII');
      return 'NSII';
    } else if (name.includes('nsi') || name.includes('ns i') || name.includes('ns-i') || name.includes('1') || name.includes('première') || name.includes('premiere') || name.includes('premier')) {
      console.log('DEBUG - Mapping trouvé: NSI');
      return 'NSI';
    }

    // Si rien n'est trouvé, retourner NSI par défaut et logger pourquoi
    console.log('DEBUG - Aucun mapping trouvé pour:', `"${className}"`, '- Retour à NSI par défaut');
    return 'NSI';
  };

  const fetchResponsables = async () => {
    try {
      const data = await studentsService.getResponsables();
      setResponsables(data);
      setFilteredResponsables(data);
    } catch (error) {
      console.error('Erreur lors du chargement des responsables:', error);
      toast.error('Erreur lors du chargement des responsables');
    }
  };

  useEffect(() => {
    // Component mounted
    if (open) {
      fetchResponsables();
      fetchAll(1, 50).catch(()=>{});

      if (mode === 'edit' && studentId) {
        setIsLoadingStudent(true);
        // Charger les données de l'élève pour l'édition
        studentsService.getStudentById(studentId).then((student: any) => {
          // Pré-remplir le formulaire
          const studentData = {
            firstName: student.user.firstName,
            lastName: student.user.lastName,
            email: student.user.email,
            gender: student.sexe === 'Homme' ? 'male' : 'female',
            dateOfBirth: new Date(student.dateOfBirth).toISOString().split('T')[0],
            placeOfBirth: student.lieuDeNaissance,
            communeDeNaissance: student.communeDeNaissance,
            hasHandicap: student.handicap === 'Oui' ? true : false,
            handicapDetails: student.handicapDetails,
            adresse: student.adresse ? JSON.stringify(student.adresse) : '',
            vacation: student.vacation === 'Matin (AM)' ? 'AM' : 'PM',
            niveauEnseignement: student.niveauEnseignement,
            grade: student.niveauEtude.replace(/ /g, '') as 'NSI' | 'NSII' | 'NSIII' | 'NSIV', // 'NS IV' -> 'NSIV' ou garde 'NSIV'
            nomMere: student.nomMere,
            prenomMere: student.prenomMere,
            statutMere: student.statutMere === 'Vivant' ? 'vivant' : 'mort',
            occupationMere: student.occupationMere,
            nomPere: student.nomPere,
            prenomPere: student.prenomPere,
            statutPere: student.statutPere === 'Vivant' ? 'vivant' : 'mort',
            occupationPere: student.occupationPere,
            responsableMode: 'select',
            personneResponsableId: student.personneResponsable?.id || '',
            selectedClassroomId: student.classroom?.id || '',
            roomId: student.room?.id || 'none',
          } as any; // Utiliser 'as any' pour contourner le typage strict de reset pour l'instant
          reset(studentData);
          if (student.user.avatarUrl) {
            setAvatarPreview(student.user.avatarUrl);
          }

          // Charger les salles de la classe de l'élève
          if (student.classroom?.id) {
            getDetails(student.classroom.id).then(() => {
              const state: any = (useClassroomStore as any).getState?.();
              const current = state?.current;
              setRooms((current?.rooms || []).map((r: any) => ({ id: r.id, name: r.name })));
            });
          }
        }).catch((err: any) => {
          console.error("Erreur lors du chargement de l'élève pour l'édition:", err);
          toast.error("Impossible de charger les données de l'élève.");
        }).finally(() => {
          setIsLoadingStudent(false);
        });
      }
    }
  }, [open, mode, studentId, fetchAll, reset, getDetails]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info('[AddStudentModal] Open state changed:', open);
  }, [open]);

  // Effet pour auto-sélectionner le niveau d'étude quand une classe est choisie
  useEffect(() => {
    if (selectedClassroomId && classrooms.length > 0) {
      const selectedClass = classrooms.find(c => c.id === selectedClassroomId);
      if (selectedClass) {
        console.log('DEBUG - Classe sélectionnée:', {
          id: selectedClass.id,
          name: selectedClass.name,
          level: selectedClass.level
        });

        const autoGrade = getGradeFromClassLevel(selectedClass.name);
        console.log('DEBUG - Niveau déterminé:', autoGrade, 'pour la classe:', selectedClass.name);

        // Seulement mettre à jour si le niveau actuel est différent
        const currentGrade = watch('grade');
        console.log('DEBUG - Niveau actuel:', currentGrade, 'nouveau niveau:', autoGrade);

        if (currentGrade !== autoGrade) {
          setValue('grade', autoGrade as 'NSI' | 'NSII' | 'NSIII' | 'NSIV');
        }
      }
    }
  }, [selectedClassroomId, classrooms, setValue, watch]);

  // Test temporaire avec des données mockées pour vérifier le mapping
  useEffect(() => {
    // Simulation de données de classe pour tester
    const testClasses = [
      { id: '1', name: 'NSI A', level: 'NSI' },
      { id: '2', name: 'NSII B', level: 'NSII' },
      { id: '3', name: 'NSIII C', level: 'NSIII' },
      { id: '4', name: 'NSIV D', level: 'NSIV' },
      { id: '5', name: 'Première année', level: 'NSI' },
      { id: '6', name: 'Deuxième année', level: 'NSII' },
      { id: '7', name: 'Classe NSIII', level: 'NSIII' },
      { id: '8', name: '3ème année', level: 'NSIII' },
      { id: '9', name: 'NS-III', level: 'NSIII' },
      { id: '10', name: 'NS 3', level: 'NSIII' }
    ];

    testClasses.forEach(c => {
      const mappedGrade = getGradeFromClassLevel(c.name);
      console.log(`TEST - Classe "${c.name}" -> Niveau déterminé: "${mappedGrade}" (attendu: "${c.level}")`);
    });
  }, []); // S'exécute une seule fois au montage

  useEffect(() => {
    if (!selectedClassroomId) { setRooms([]); return; }
    (async () => {
      try {
        setRoomsLoading(true);
        await getDetails(selectedClassroomId);
        const state: any = (useClassroomStore as any).getState?.();
        const current = state?.current;
        setRooms((current?.rooms || []).map((r: any)=>({ id: r.id, name: r.name })));
        setValue('roomId', 'none');
      } catch {}
      finally { setRoomsLoading(false); }
    })();
  }, [selectedClassroomId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResponsables(responsables);
    } else {
      const filtered = responsables.filter(r => {
        const fullName = `${r.user.firstName} ${r.user.lastName}`.toLowerCase();
        const phone = r.user.phone?.toLowerCase() || '';
        const lienParente = r.lienParente.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || phone.includes(search) || lienParente.includes(search);
      });
      setFilteredResponsables(filtered);
    }
  }, [responsables, searchTerm]);

  const onSubmit = async (data: any) => {
    setSubmitError(null);
    try {
      if (!data.selectedClassroomId) throw new Error('Veuillez sélectionner une classe.');
      if (!data.roomId || data.roomId === 'none') throw new Error('Veuillez sélectionner une salle.');

      // Construire l'adresse objet
      let adresse: any = undefined;
      if (data.adresse) {
        try {
          const parsed = JSON.parse(data.adresse);
          adresse = parsed && typeof parsed === 'object' ? parsed : { description: data.adresse };
        } catch {
          adresse = { description: data.adresse };
        }
      } else { adresse = { description: '' }; }

      // Construire createPersonneResponsable si mode create
      let createPersonneResponsable: AddStudentApiPayload['createPersonneResponsable'] | undefined = undefined;
      let responsableId: string | undefined = undefined;
      if (responsableMode === 'select' && data.personneResponsableId) {
        responsableId = data.personneResponsableId;
      } else if (responsableMode === 'create' && data.responsable?.firstName && data.responsable?.lastName && data.responsable?.lienParente) {
        createPersonneResponsable = {
          firstName: data.responsable.firstName,
          lastName: data.responsable.lastName,
          lienParente: data.responsable.lienParente,
          email: data.responsable.email || undefined,
          phone: data.responsable.phone || undefined,
          nif: data.responsable.nif || undefined,
          ninu: data.responsable.ninu || undefined,
        };
      }

      const payload: AddStudentApiPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        sexe: data.gender === 'male' ? 'Homme' : 'Femme',
        dateOfBirth: new Date(data.dateOfBirth).toISOString().split('T')[0],
        avatar: avatarFile || undefined,
        lieuDeNaissance: data.placeOfBirth,
        communeDeNaissance: data.communeDeNaissance,
        hasHandicap: !!data.hasHandicap,
        handicapDetails: data.handicapDetails || undefined,
        adresse,
        vacation: data.vacation === 'AM' ? 'Matin (AM)' : 'Après-midi (PM)',
        niveauEnseignement: data.niveauEnseignement,
        niveauEtude: data.grade, // Envoyer directement NSI, NSII, NSIII, NSIV sans espace
        nomMere: data.nomMere,
        prenomMere: data.prenomMere,
        statutMere: data.statutMere === 'vivant' ? 'Vivant' : 'Mort',
        occupationMere: data.occupationMere || undefined,
        nomPere: data.nomPere,
        prenomPere: data.prenomPere,
        statutPere: data.statutPere === 'vivant' ? 'Vivant' : 'Mort',
        occupationPere: data.occupationPere || undefined,
        personneResponsableId: responsableId,
        createPersonneResponsable,
        classroomId: data.selectedClassroomId,
        roomId: data.roomId,
      };

      // Si mode création de responsable, créer d'abord le responsable
      let finalResponsableId = payload.personneResponsableId;
      if (!finalResponsableId && payload.createPersonneResponsable) {
        const responsableResult = await studentsService.addResponsable(payload.createPersonneResponsable);
        finalResponsableId = responsableResult.id;
      }

      // Créer le payload final avec l'ID du responsable
      const finalPayload = {
        ...payload,
        personneResponsableId: finalResponsableId,
        createPersonneResponsable: undefined // Ne plus envoyer les données de création
      };

      if (mode === 'edit' && studentId) {
        // En mode édition, ne pas envoyer l'avatar si non modifié
        const updatePayload = { ...finalPayload };
        if (!avatarFile) {
          delete updatePayload.avatar;
        }
        await studentsService.updateStudent(studentId, updatePayload);
        toast.success('Élève mis à jour avec succès !');
      } else {
        await studentsService.addStudent(finalPayload);
        toast.success('Élève enregistré avec succès !');
      }
      onOpenChange(false);
      reset();
      if (onSuccess) onSuccess();
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || "Une erreur s'est produite lors de l'enregistrement.";
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // UI
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Modifier l\'élève' : 'Ajouter un nouvel élève'}</DialogTitle>
          <DialogDescription>{mode === 'edit' ? 'Modifiez les informations de l\'élève.' : 'Remplissez tous les champs requis.'}</DialogDescription>
        </DialogHeader>

        {isSubmitting && (
          <Alert className="mb-2">
            <AlertDescription>Appel API en cours: POST /students/add-student ...</AlertDescription>
          </Alert>
        )}
        {submitError && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {isLoadingStudent ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Identité et naissance */}
          <Card className="shadow-sm border-0 w-full">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
              <CardTitle className="text-base text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Identité
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Photo de profil */}
              <div className="mb-6">
                <FormField label="Photo de profil" error={errors.avatar?.message as any}>
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <div className="relative">
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          style={{ borderRadius: '25px' }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => {
                            setAvatarPreview(null);
                            setAvatarFile(null);
                            setValue('avatar', undefined);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
                           style={{ borderRadius: '25px' }}>
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImageCrop(true)}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      {avatarPreview ? 'Changer la photo' : 'Ajouter une photo'}
                    </Button>
                  </div>
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Nom" required error={errors.lastName?.message as any}>
                  <Input {...register('lastName')} placeholder="Nom" className="h-9" />
                </FormField>
                <FormField label="Prénom" required error={errors.firstName?.message as any}>
                  <Input {...register('firstName')} placeholder="Prénom" className="h-9" />
                </FormField>
                <FormField label="Sexe" required error={errors.gender?.message as any}>
                  <Controller name="gender" control={control} render={({field}) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  )}/>
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Date de naissance" required error={errors.dateOfBirth?.message as any}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input type="date" {...register('dateOfBirth')} className="h-9 pl-9" />
                  </div>
                </FormField>
                <FormField label="Lieu de naissance" required error={errors.placeOfBirth?.message as any}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input {...register('placeOfBirth')} placeholder="Ville, Département" className="h-9 pl-9" />
                  </div>
                </FormField>
                <FormField label="Commune de naissance" required error={(errors as any).communeDeNaissance?.message}>
                  <Input {...register('communeDeNaissance' as any)} placeholder="Commune" className="h-9" />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Email" error={errors.email?.message as any}>
                  <Input type="email" {...register('email')} placeholder="email@exemple.com" className="h-9" />
                </FormField>
                <FormField label="Vacation" required error={(errors as any).vacation?.message}>
                  <Controller name={'vacation' as any} control={control as any} render={({field}) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="AM/PM" /></SelectTrigger>
                      <SelectContent>
                        {VACATION_OPTIONS.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}/>
                </FormField>
                <FormField label="Niveau d'enseignement" required error={(errors as any).niveauEnseignement?.message}>
                  <Controller name={'niveauEnseignement' as any} control={control as any} render={({field}) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Fondamentale / Secondaire" /></SelectTrigger>
                      <SelectContent>
                        {TEACHING_LEVEL_OPTIONS.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}/>
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <FormField label="Handicap">
                  <div className="flex items-center gap-2 h-9">
                    <input type="checkbox" className="h-4 w-4" {...register('hasHandicap' as any)} />
                    <span className="text-sm text-muted-foreground">Élève en situation de handicap</span>
                  </div>
                </FormField>
                <FormField label="Détails du handicap">
                  <Input {...register('handicapDetails' as any)} placeholder="Précisions si applicable" className="h-9" />
                </FormField>
                <FormField label={"Adresse (objet)"} required error={(errors as any).adresse?.message}>
                  <Textarea {...register('adresse' as any)} placeholder='Texte libre ou JSON: {"rue":"...","ville":"..."}' className="min-h-[60px]" />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Classe / Salle / Niveau d'étude */}
          <Card className="shadow-sm border-0 w-full">
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20 rounded-t-lg">
              <CardTitle className="text-base text-purple-800 dark:text-purple-200 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                Classe et Salle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Classe" required error={(errors as any).selectedClassroomId?.message}>
                  <Controller name={'selectedClassroomId' as any} control={control as any} render={({field}) => (
                    <Select value={field.value} onValueChange={async (val)=>{ field.onChange(val); try{ await getDetails(val); const st:any=(useClassroomStore as any).getState?.(); setRooms((st?.current?.rooms||[]).map((r:any)=>({id:r.id,name:r.name}))); setValue('roomId','none'); }catch{}}}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
                      <SelectContent>
                        {classrooms.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}/>
                </FormField>
                <FormField label="Niveau d'étude (NSI..NSIV)" required error={errors.grade?.message as any}>
                  <Controller name={'grade' as any} control={control as any} render={({field}) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!!selectedClassroomId} // Désactiver si une classe est sélectionnée
                    >
                      <SelectTrigger className={`h-9 ${selectedClassroomId ? 'bg-gray-50 text-gray-600' : ''}`}>
                        <SelectValue placeholder={selectedClassroomId ? 'Auto-sélectionné depuis la classe' : 'NSI..NSIV'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NSI">NSI</SelectItem>
                        <SelectItem value="NSII">NSII</SelectItem>
                        <SelectItem value="NSIII">NSIII</SelectItem>
                        <SelectItem value="NSIV">NSIV</SelectItem>
                      </SelectContent>
                    </Select>
                  )}/>
                </FormField>
                <FormField label="Salle" required error={(errors as any).roomId?.message}>
                  <Controller name={'roomId' as any} control={control as any} render={({field}) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={roomsLoading}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={roomsLoading ? 'Chargement...' : 'Sélectionner une salle'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {rooms.map(r => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}/>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Parents */}
          <Card className="shadow-sm border-0 w-full">
            <CardHeader className="bg-orange-50 dark:bg-orange-900/20 rounded-t-lg">
              <CardTitle className="text-base text-orange-800 dark:text-orange-200 flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                Parents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Nom du père" required error={(errors as any).nomPere?.message}><Input {...register('nomPere' as any)} className="h-9" /></FormField>
                <FormField label="Prénom du père" required error={(errors as any).prenomPere?.message}><Input {...register('prenomPere' as any)} className="h-9" /></FormField>
                <FormField label="Statut du père" required error={(errors as any).statutPere?.message}>
                  <Controller name="statutPere" control={control} render={({field}) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vivant">Vivant</SelectItem>
                        <SelectItem value="mort">Mort</SelectItem>
                      </SelectContent>
                    </Select>
                  )}/>
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Nom de la mère" required error={(errors as any).nomMere?.message}><Input {...register('nomMere' as any)} className="h-9" /></FormField>
                <FormField label="Prénom de la mère" required error={(errors as any).prenomMere?.message}><Input {...register('prenomMere' as any)} className="h-9" /></FormField>
                <FormField label="Statut de la mère" required error={(errors as any).statutMere?.message}>
                  <Controller name="statutMere" control={control} render={({field}) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vivant">Vivant</SelectItem>
                        <SelectItem value="mort">Mort</SelectItem>
                      </SelectContent>
                    </Select>
                  )}/>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Occupation du père"><Input {...register('occupationPere' as any)} className="h-9" /></FormField>
                <FormField label="Occupation de la mère"><Input {...register('occupationMere' as any)} className="h-9" /></FormField>
              </div>
            </CardContent>
          </Card>

          {/* Personne responsable */}
          <Card className="shadow-sm border-0 w-full">
            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/20 rounded-t-lg">
              <CardTitle className="text-base text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                Personne responsable
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <FormField label="Mode" required>
                <Controller name={'responsableMode' as any} control={control as any} render={({field}) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Sélectionner</SelectItem>
                      <SelectItem value="create">Créer</SelectItem>
                    </SelectContent>
                  </Select>
                )}/>
              </FormField>

              {responsableMode === 'select' ? (
                <div className="space-y-2">
                  <FormField label="Rechercher un responsable">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input 
                        placeholder="Rechercher par nom, prénom ou téléphone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 pl-9"
                      />
                    </div>
                  </FormField>
                  <FormField label="Responsable existant" required>
                    <Controller name={'personneResponsableId' as any} control={control as any} render={({field}) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Sélectionner une personne" /></SelectTrigger>
                        <SelectContent>
                          {filteredResponsables.length > 0 ? (
                            filteredResponsables.map(r => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.user.firstName} {r.user.lastName} - {r.lienParente}
                                {r.user.phone && <span className="text-xs text-gray-500 ml-2">({r.user.phone})</span>}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-results" disabled>Aucun résultat trouvé</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}/>
                  </FormField>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Prénom" required><Input {...register('responsable.firstName' as any)} className="h-9" /></FormField>
                  <FormField label="Nom" required><Input {...register('responsable.lastName' as any)} className="h-9" /></FormField>
                  <FormField label="Lien de parenté" required>
                    <Controller name={'responsable.lienParente' as any} control={control as any} render={({field}) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Lien" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="père">Père</SelectItem>
                          <SelectItem value="mère">Mère</SelectItem>
                          <SelectItem value="tuteur">Tuteur</SelectItem>
                          <SelectItem value="tutrice">Tutrice</SelectItem>
                          <SelectItem value="grand-parent">Grand-parent</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    )}/>
                  </FormField>
                  <FormField label="Téléphone"><Input {...register('responsable.phone' as any)} className="h-9" /></FormField>
                  <FormField label="Email"><Input type="email" {...register('responsable.email' as any)} className="h-9" /></FormField>
                  <FormField label="NIF"><Input {...register('responsable.nif' as any)} className="h-9" /></FormField>
                  <FormField label="NINU"><Input {...register('responsable.ninu' as any)} className="h-9" /></FormField>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={()=>onOpenChange(false)} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              {isSubmitting ? (mode === 'edit' ? 'Mise à jour...' : 'Enregistrement...') : (mode === 'edit' ? 'Mettre à jour' : 'Enregistrer l\'élève')}
            </Button>
          </div>
          </form>
        )}

        {/* Image Crop Modal */}
        <ImageCrop
          open={showImageCrop}
          onOpenChange={setShowImageCrop}
          onImageCropped={(file) => {
            setAvatarFile(file);
            setValue('avatar', file);
            // Créer une URL de prévisualisation
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
          }}
          aspectRatio={1}
          circularCrop={true}
        />
      </DialogContent>
    </Dialog>
  );
}
