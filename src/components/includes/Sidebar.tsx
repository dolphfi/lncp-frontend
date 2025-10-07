import * as React from "react"
import {
  BarChart,
  BookOpen,
  Calendar,
  EllipsisVertical,
  Fence,
  FileText,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  ListPlus,
  PanelLeft,
  PanelRight,
  Settings,
  User,
  UserPlus,
  UserRoundCog,
  Wallet,
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useAuthStore } from "../../stores/authStoreSimple"
import authService from "../../services/authService"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useCanAccessNotes, useCanManageCourses, useCanManageEmployees, useCanManageNotes, useCanManageStudents } from "hooks/usePermissions"

interface SidebarLinkProps {
  to: string
  label: string
  icon: React.ElementType
  subItems?: { to: string; label: string }[]
  openAccordion?: string | undefined
  setOpenAccordion?: (value: string | undefined) => void
}

const SidebarLink = ({ to, label, icon: Icon, subItems, openAccordion, setOpenAccordion }: SidebarLinkProps) => {
  const { state } = useSidebar()
  const location = useLocation()

  const isSubItemActive = React.useMemo(() => {
    if (!subItems) return false
    return subItems.some(item => location.pathname.startsWith(item.to))
  }, [subItems, location.pathname])

  // Accordion for expanded sidebar with sub-items
  if (state === "expanded" && subItems && subItems.length > 0) {
    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={openAccordion}
        onValueChange={setOpenAccordion}
      >
        <AccordionItem value={label} className="border-b-0">
          <AccordionTrigger
            className={cn(
              "flex w-full justify-start rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:no-underline [&>div]:justify-start [&>div]:text-left",
              isSubItemActive && "bg-accent text-accent-foreground"
            )}
            style={{ textAlign: 'left' }}
          >
            <div className="flex flex-1 items-center justify-start text-left">
              <Icon className="mr-4 h-5 w-5" />
              <span className="text-left">{label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-1 pl-7">
            <div className="flex flex-col space-y-1">
              {subItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isActive &&
                      "bg-accent font-semibold text-accent-foreground"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  // Regular link for collapsed sidebar or items without sub-items
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full",
            state === "expanded" ? "justify-start" : "justify-center"
          )}
          asChild
        >
          <NavLink
            to={to}
            className={({ isActive }) =>
              cn(
                "flex w-full items-center",
                (isActive || (state === "expanded" && isSubItemActive)) &&
                "bg-accent text-accent-foreground"
              )
            }
          >
            <Icon className={cn("h-5 w-5", state === "expanded" && "mr-4")} />
            {state === "expanded" && label}
          </NavLink>
        </Button>
      </TooltipTrigger>
      {state === "collapsed" && (
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}

const AppSidebar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar()
  const navigate = useNavigate()
  const { logout, isLoading, user } = useAuthStore()
  const [displayName, setDisplayName] = React.useState<string>("")
  const [displayRole, setDisplayRole] = React.useState<string>("")
  const [displayAvatar, setDisplayAvatar] = React.useState<string | undefined>(undefined)

  // Hooks de permissions
  const canManageStudents = useCanManageStudents()
  const canManageCourses = useCanManageCourses()
  const canManageNotes = useCanManageNotes()
  const canAccessNotes = useCanAccessNotes()
  const canManageEmployees = useCanManageEmployees()

  // Vérifier si l'utilisateur est un étudiant ou un parent
  const isStudentOrParent = user?.role === 'STUDENT' || user?.role === 'PARENT'

  React.useEffect(() => {
    // Fallback depuis le store
    if (user) {
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
      setDisplayName(name)
      setDisplayRole(user.role)
      // tentative d'avatar depuis le store si présent
      const avatarFromStore = (user as any).avatarUrl || (user as any).avatar_url
      if (avatarFromStore) setDisplayAvatar(avatarFromStore)
    }
    // Tenter de récupérer le profil complet
    let cancelled = false
    authService.getMe().then((me) => {
      if (cancelled) return
      const name = [me.firstName, me.lastName].filter(Boolean).join(" ") || me.email
      setDisplayRole(me.role)
      if (me.avatarUrl) setDisplayAvatar(me.avatarUrl)
    }).catch((error) => console.error('Error fetching user profile:', error))
    return () => { cancelled = true }
  }, [user, isStudentOrParent, navigate])

  // Écoute les mises à jour du profil pour rafraîchir instantanément l'UI
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.firstName || detail.lastName) {
        const name = [detail.firstName, detail.lastName].filter(Boolean).join(" ") || detail.email || displayName
        setDisplayName(name)
      }
      const name = [detail.firstName, detail.lastName].filter(Boolean).join(" ") || detail.email || displayName
      setDisplayName(name)
      if (detail.role) setDisplayRole(detail.role)
      if (detail.avatarUrl) setDisplayAvatar(detail.avatarUrl)
    }
    document.addEventListener('profile:updated', handler as EventListener)
    return () => document.removeEventListener('profile:updated', handler as EventListener)
  }, [displayName])
  // Écoute les mises à jour du profil pour rafraîchir instantanément l'UI
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const name = [detail.firstName, detail.lastName].filter(Boolean).join(" ") || detail.email || displayName
      setDisplayName(name)
      if (detail.role) setDisplayRole(detail.role)
      if (detail.avatarUrl) setDisplayAvatar(detail.avatarUrl)
    }
    document.addEventListener('profile:updated', handler as EventListener)
    return () => document.removeEventListener('profile:updated', handler as EventListener)
  }, [displayName])

  const [openAccordion, setOpenAccordion] = React.useState<string | undefined>(undefined)

  // Construire les groupes de navigation avec les permissions
  const navGroups = React.useMemo(() => {
    const groups = []

    // Menu spécial pour les élèves et parents
    if (isStudentOrParent) {
      if (user?.role === 'STUDENT') {
        groups.push({
          title: "Mon Espace",
          items: [
            { to: "/student-profile", label: "Mon Profil", icon: User },
          ],
        })
      } else if (user?.role === 'PARENT') {
        groups.push({
          title: "Mes Élèves",
          items: [
            { to: "/student-profile", label: "Mes Élèves", icon: GraduationCap },
          ],
        })
      }
      return groups
    }

    // Général - accessible aux autres utilisateurs
    groups.push({
      title: "Général",
      items: [
        { to: "/dashboard", label: "Tableau de bord", icon: Gauge },
      ],
    })

    // Gestion Élèves - seulement si on peut gérer les étudiants
    if (canManageStudents) {
      groups.push({
        title: "Gestion Élèves",
        items: [
          {
            to: "/students",
            label: "Élèves",
            icon: GraduationCap,
            subItems: [
              { to: "/students", label: "Liste" },
              { to: "/archives", label: "Archives" },
              { to: "/badges", label: "Badges" },
            ],
          },
          {
            to: "/registrations",
            label: "Inscription",
            icon: UserPlus,
            subItems: [
              { to: "/registrations", label: "Liste" },
              { to: "/concours", label: "Concours" },
              { to: "/re_registration", label: "Réinscription" },
            ],
          },
        ],
      })
    }

    // Gestion Cours et Notes
    if (canManageCourses || canManageNotes || canAccessNotes) {
      groups.push({
        title: "Gestion Cours et Notes",
        items: [
          // Cours - seulement si on peut gérer les cours
          ...(canManageCourses ? [{
            to: "/courses",
            label: "Cours",
            icon: BookOpen,
            subItems: [
              { to: "/courses", label: "Liste des cours" },
              { to: "/schedules", label: "Gestion Horaires" },
              { to: "/enrollments", label: "Inscriptions" },
            ],
          }] : []),
          // Mon Horaire - accessible aux enseignants et suppléants avec academic.read
          ...((canAccessNotes && (user?.role === 'TEACHER' || user?.role === 'SUPPLEANT')) ? [{
            to: "/schedules/my-schedule",
            label: "Mon Horaire",
            icon: Calendar,
          }] : []),
          // Gestion Notes - seulement si on peut gérer ou accéder aux notes
          ...(canManageNotes || canAccessNotes ? [{
            to: "/academic/notes",
            label: "Gestion Notes",
            icon: ListPlus,
            subItems: [
              ...(canManageNotes ? [{ to: "/academic/notes/entry", label: "Saisie de notes" }] : []),
              { to: "/academic/notes/list", label: "Consultation des notes" },
              // Bulletins - seulement pour les administrateurs et secrétaires, pas pour les professeurs ni directeurs
              ...(user?.role !== 'TEACHER' && user?.role !== 'SUPPLEANT' && user?.role !== 'DIRECTOR' && user?.role !== 'CENSORED' ? [
                { to: "/academic/bulletins/individual", label: "Bulletin Individuel" },
                { to: "/academic/bulletins/collective", label: "Bulletin Collectif" },
              ] : []),
            ],
          }] : []),
        ],
      })
    }

    // Gestion Ressources
    if (canManageEmployees) {
      groups.push({
        title: "Gestion Ressources",
        items: [
          {
            to: "/ressource",
            label: "Ressources Humaines",
            icon: UserRoundCog,
            subItems: [
              { to: "/employee", label: "Employés" },
            ],
          },
          // Masquer les ressources matérielles et financières pour le secrétaire et les directeurs
          ...(user?.role !== 'SECRETARY' && user?.role !== 'DIRECTOR' && user?.role !== 'CENSORED' ? [
            {
              to: "/ressources",
              label: "Ressources Matériel",
              icon: Fence,
              subItems: [
                { to: "/roles", label: "Liste" },
              ],
            },
            {
              to: "/ress",
              label: "Ressources Financière",
              icon: Wallet,
              subItems: [
                { to: "/payments", label: "Paiments Élèves" },
              ],
            },
          ] : []),
        ],
      })
    }

    // Autre - paramètres (seulement pour les administrateurs)
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      groups.push({
        title: "Autre",
        items: [
          {
            to: "/settings",
            label: "Paramètres",
            icon: Settings,
            subItems: [
              { to: "/admin_panel", label: "Panel Admin" },
              { to: "/users", label: "Utilisateurs" },
            ],
          },
        ],
      })
    }

    return groups
  }, [canManageStudents, canManageCourses, canManageNotes, canAccessNotes, canManageEmployees, user?.role, isStudentOrParent])

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className={cn("flex h-14 flex-row items-center", state === "expanded" ? "justify-between px-4" : "justify-center px-2")}>
        {state === "expanded" && (
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h5 className="text-xs font-bold text-blue-900">Lycée national Charlemagne Péralte</h5>
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              {state === 'expanded' ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{state === "expanded" ? "Réduire la barre latérale" : "Agrandir la barre latérale"}</p>
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>
      <Separator />

      <SidebarContent className="space-y-0">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title} className="mb-0 mt-0">
            <SidebarGroupLabel className="px-2 py-0 text-xs font-medium text-muted-foreground mb-0 mt-0">{group.title}</SidebarGroupLabel>
            {group.items.map(item => (
              <SidebarLink key={item.label} {...item} openAccordion={openAccordion} setOpenAccordion={setOpenAccordion} />
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-8 w-8 rounded-full border-2 border-primary flex-shrink-0 overflow-hidden">
                {displayAvatar ? (
                  <AvatarImage src={displayAvatar} />
                ) : null}
                <AvatarFallback>{(displayName || "U").slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {state === "expanded" && (
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{displayName || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground">{displayRole || "Rôle"}</p>
                </div>
              )}
            </div>
            {state === "expanded" && (
              <EllipsisVertical className="h-5 w-5 flex-shrink-0" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "start" : "end"}
            className="w-64"
            sideOffset={8}
            alignOffset={isMobile ? 0 : 40}
          >
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>Profil</DropdownMenuItem>
            <DropdownMenuItem>Paramètres</DropdownMenuItem>
            <DropdownMenuItem>Équipe</DropdownMenuItem>
            <DropdownMenuItem>Abonnement</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isLoading}
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar