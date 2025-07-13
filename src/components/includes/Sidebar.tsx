import * as React from "react"
import {
  BarChart,
  BookOpen,
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
  UserPlus,
  UserRoundCog,
  Wallet,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

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

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

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
  const [openAccordion, setOpenAccordion] = React.useState<string | undefined>(undefined)

  const navGroups = [
    {
      title: "Général",
      items: [
        { to: "/dashboard", label: "Tableau de bord", icon: Gauge },
        { to: "/analytics", label: "Analyses", icon: BarChart },
        { to: "/reports", label: "Rapports", icon: FileText },
      ],
    },
    {
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
    },
    {
      title: "Gestion Cours et Notes",
      items: [
        {
          to: "/course",
          label: "Cours",
          icon: BookOpen,
          subItems: [
            { to: "/courses", label: "Cours" },
            { to: "/schedules", label: "Horaires" },
          ],
        },
        {
          to: "/notes",
          label: "Notes",
          icon: ListPlus,
          subItems: [
            { to: "/notes", label: "Notes" },
            { to: "/bulletins", label: "Bulletin" },
          ],
        },
      ],
    },

    {
      title: "Gestion Ressources",
      items: [
        {
          to: "/ressource",
          label: "Ressources Humaines",
          icon: UserRoundCog,
          subItems: [
            { to: "/employee", label: "Employés" },
            // { to: "/users/new", label: "Nouveau" },
            // { to: "/users/new", label: "Nouveau" },
            // { to: "/users/new", label: "Nouveau" },
          ],
        },
        {
          to: "/ressources",
          label: "Ressources Matériel",
          icon: Fence,
          subItems: [
            { to: "/roles", label: "Liste" },
            // { to: "/roles/new", label: "Nouveau" },
          ],
        },
        {
          to: "/ress",
          label: "Ressources Financière",
          icon: Wallet,
          subItems: [
            { to: "/payments", label: "Paiments Élèves" },
            // { to: "/roles/new", label: "Nouveau" },
          ],
        },
      ],
    },
    {
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
    },
  ]

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
              <Avatar className="h-8 w-8 rounded-full border-2 border-primary flex-shrink-0">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              {state === "expanded" && (
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">Rodolph Phayendy Delon</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
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
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Paramètres</DropdownMenuItem>
            <DropdownMenuItem>Équipe</DropdownMenuItem>
            <DropdownMenuItem>Abonnement</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Déconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar