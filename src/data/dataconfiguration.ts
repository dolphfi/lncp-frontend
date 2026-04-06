interface SiteConfiguration {
    id: string;
    title: string;
    mission: string;
    created_at: string;
    updated_at: string;
}

interface Programmes {
    id: string;
    niveau: string;
    details: string;
    created_at: string;
    updated_at: string;
}

interface Gallery {
    id: string;
    title: string;
    category: string;
    image: string;
    created_at: string;
    updated_at: string;
}

interface Administrations {
    id: string;
    name: string;
    image: string;
    role: string;
    email: string;
    phone: string;
    address: string;
    created_at: string;
    updated_at: string;
}

interface Slides {
    id: string,
    image: string;
    title: string;
    subtitle: string;
    description: string;
    cta: string;
}
export const siteConfiguration: SiteConfiguration[] = []
export const programmes: Programmes[] = []
export const gallery: Gallery[] = []
export const administrations: Administrations[] = []
export const slides: Slides[] = []