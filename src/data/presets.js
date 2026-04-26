import { nanoid } from '../utils/nanoid.js'

export const PRESETS = [
  {
    id: 'amazon_music',
    label: 'Amazon Music × PR Festival 2026',
    projectName: 'Amazon Music × PR Festival 2026',
    clientName: 'Deanna / Decor and Culture',
    pmPercent: 15,
    sections: [
      {
        id: 'main',
        label: '',
        items: [
          { id: nanoid(), name: 'Aerial full-footprint rendering',   resource: 'mostafa_general', hours: 24, category: 'renderings'     },
          { id: nanoid(), name: 'Design direction / creative concepting', resource: 'becky',     hours: 12, category: 'graphic_design'  },
          { id: nanoid(), name: 'Piragua truck wrap',                resource: 'julio',           hours: 14, category: 'graphic_design'  },
          { id: nanoid(), name: 'Ice cream cart wrap',               resource: 'stef',            hours: 10, category: 'graphic_design'  },
          { id: nanoid(), name: 'DJ booth wrap',                     resource: 'julio',           hours: 10, category: 'graphic_design'  },
          { id: nanoid(), name: 'Dance floor graphic',               resource: 'brandon',         hours: 8,  category: 'graphic_design'  },
          { id: nanoid(), name: 'Entrance signage',                  resource: 'brandon',         hours: 6,  category: 'graphic_design'  },
          { id: nanoid(), name: 'Wayfinding & engagement signage',   resource: 'brandon',         hours: 8,  category: 'graphic_design'  },
          { id: nanoid(), name: 'Photo moment design',               resource: 'stef',            hours: 8,  category: 'graphic_design'  },
          { id: nanoid(), name: 'Giveaway: mesh tote bag',           resource: 'brandon',         hours: 4,  category: 'graphic_design'  },
          { id: nanoid(), name: 'Giveaway: water bottle',            resource: 'brandon',         hours: 3,  category: 'graphic_design'  },
          { id: nanoid(), name: 'Giveaway: pava hat',                resource: 'brandon',         hours: 3,  category: 'graphic_design'  },
          { id: nanoid(), name: 'Giveaway: domino set',              resource: 'brandon',         hours: 4,  category: 'graphic_design'  },
          { id: nanoid(), name: 'Giveaway: flag',                    resource: 'brandon',         hours: 3,  category: 'graphic_design'  },
        ],
      },
    ],
  },
  {
    id: 'gbef_essence',
    label: 'GBEF × Essence Fest (Pop by Yaz)',
    projectName: 'GBEF × Essence Fest — Pop by Yaz',
    clientName: 'Cherise / Pop by Yaz',
    pmPercent: 15,
    sections: [
      {
        id: 'queer_space',
        label: 'Program A — Queer Space',
        items: [
          { id: nanoid(), name: 'Signage package',              resource: 'stef',    hours: 10, category: 'graphic_design' },
          { id: nanoid(), name: 'FOH branding',                 resource: 'becky',   hours: 12, category: 'graphic_design' },
          { id: nanoid(), name: 'Digital / social assets',      resource: 'julio',   hours: 8,  category: 'graphic_design' },
          { id: nanoid(), name: 'Print-ready production files', resource: 'brandon', hours: 6,  category: 'graphic_design' },
        ],
      },
      {
        id: 'health_dinner',
        label: 'Program B — Future of Health Dinner',
        items: [
          { id: nanoid(), name: 'Signage package',              resource: 'stef',    hours: 8,  category: 'graphic_design' },
          { id: nanoid(), name: 'FOH branding',                 resource: 'becky',   hours: 10, category: 'graphic_design' },
          { id: nanoid(), name: 'Digital / social assets',      resource: 'julio',   hours: 6,  category: 'graphic_design' },
          { id: nanoid(), name: 'Print-ready production files', resource: 'brandon', hours: 4,  category: 'graphic_design' },
        ],
      },
    ],
  },
]
