/**
 * Configuration des couleurs RIASEC pour le labyrinthe
 * Chaque type RIASEC a une couleur principale et une variation light
 */

export const RIASEC_COLORS = {
  R: {
    letter: 'R',
    name: {
      fr: 'Réaliste',
      ar: 'واقعي'
    },
    color: '#EF4444', // Rouge
    lightColor: '#FEE2E2', // Rouge light
    description: {
      fr: 'Personnes pratiques, orientées vers les activités concrètes et manuelles',
      ar: 'أشخاص عمليون، موجهون نحو الأنشطة الملموسة واليدوية'
    }
  },
  I: {
    letter: 'I',
    name: {
      fr: 'Investigateur',
      ar: 'استقصائي'
    },
    color: '#3B82F6', // Bleu
    lightColor: '#DBEAFE', // Bleu light
    description: {
      fr: 'Personnes analytiques, orientées vers la recherche et l\'investigation',
      ar: 'أشخاص تحليليون، موجهون نحو البحث والتحقيق'
    }
  },
  A: {
    letter: 'A',
    name: {
      fr: 'Artistique',
      ar: 'فني'
    },
    color: '#8B5CF6', // Violet
    lightColor: '#EDE9FE', // Violet light
    description: {
      fr: 'Personnes créatives, orientées vers l\'expression artistique et l\'innovation',
      ar: 'أشخاص مبدعون، موجهون نحو التعبير الفني والابتكار'
    }
  },
  S: {
    letter: 'S',
    name: {
      fr: 'Social',
      ar: 'اجتماعي'
    },
    color: '#10B981', // Vert
    lightColor: '#D1FAE5', // Vert light
    description: {
      fr: 'Personnes empathiques, orientées vers l\'aide et le service aux autres',
      ar: 'أشخاص متعاطفون، موجهون نحو المساعدة وخدمة الآخرين'
    }
  },
  E: {
    letter: 'E',
    name: {
      fr: 'Entreprenant',
      ar: 'مبادر'
    },
    color: '#F59E0B', // Orange
    lightColor: '#FEF3C7', // Orange light
    description: {
      fr: 'Personnes ambitieuses, orientées vers le leadership et l\'entrepreneuriat',
      ar: 'أشخاص طموحون، موجهون نحو القيادة وريادة الأعمال'
    }
  },
  C: {
    letter: 'C',
    name: {
      fr: 'Conventionnel',
      ar: 'تقليدي'
    },
    color: '#EAB308', // Jaune
    lightColor: '#FEF9C3', // Jaune light
    description: {
      fr: 'Personnes organisées, orientées vers les tâches structurées et administratives',
      ar: 'أشخاص منظمون، موجهون نحو المهام المنظمة والإدارية'
    }
  }
} as const;

export type RiasecType = keyof typeof RIASEC_COLORS;

/**
 * Obtenir les couleurs pour un type RIASEC
 */
export const getRiasecColors = (type: RiasecType) => {
  return RIASEC_COLORS[type];
};

/**
 * Obtenir toutes les lettres RIASEC
 */
export const getRiasecLetters = (): RiasecType[] => {
  return Object.keys(RIASEC_COLORS) as RiasecType[];
};

