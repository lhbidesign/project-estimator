export const STUDIO_RATE = 150
export const PM_RATE     = 45   // Dee's internal cost per hour

export const RESOURCES = {
  brandon:         { label: 'Brandon',           billedRate: 150, internalRate: 55  },
  stef:            { label: 'Stef',              billedRate: 150, internalRate: 65  },
  julio:           { label: 'Julio',             billedRate: 150, internalRate: 65  },
  becky:           { label: 'Becky',             billedRate: 150, internalRate: 75  },
  mostafa_general: { label: 'Mostafa – General', billedRate: 150, internalRate: 45  },
  mostafa_oncall:  { label: 'Mostafa – On-Call', billedRate: 200, internalRate: 100 },
}

// Line-item categories (used in estimator)
export const CATEGORIES = [
  {
    id: 'renderings',
    label: '3D & Renderings',
    deliverables: [
      'Aerial full-footprint rendering',
      'Individual element rendering',
      'General 3D modeling / design',
      'On-call / rush rendering',
    ],
  },
  {
    id: 'graphic_design',
    label: 'Graphic Design',
    deliverables: [
      'Design direction / creative concepting',
      'Vehicle / asset wrap',
      'Floor graphics',
      'Signage package',
      'Photo moment design',
      'Giveaway item design',
      'Social / digital assets',
      'Print-ready production files',
      'Custom line item',
    ],
  },
]

// Project-type categories (used in Rate Card hour guide tabs)
export const PROJECT_CATEGORIES = [
  { id: 'experiential',   label: 'Experiential'         },
  { id: 'branding',       label: 'Branding'             },
  { id: 'web',            label: 'Web Design & Dev'     },
  { id: 'presentation',   label: 'Presentation'         },
  { id: 'general_design', label: 'General Design'       },
]

export const HOUR_GUIDES = [
  // ── Experiential ──
  { projectCategory: 'experiential', category: 'renderings',     name: 'Aerial full-footprint rendering',    min: 16, max: 32, resource: 'mostafa_general' },
  { projectCategory: 'experiential', category: 'renderings',     name: 'Individual element rendering',        min: 4,  max: 12, resource: 'mostafa_general' },
  { projectCategory: 'experiential', category: 'renderings',     name: 'General 3D modeling / design',        min: 8,  max: 24, resource: 'mostafa_general' },
  { projectCategory: 'experiential', category: 'renderings',     name: 'On-call / rush rendering',            min: 2,  max: 8,  resource: 'mostafa_oncall'  },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Design direction / concepting',       min: 8,  max: 16, resource: 'becky'           },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Vehicle / asset wrap',                min: 8,  max: 18, resource: 'julio'           },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Floor graphics',                      min: 4,  max: 10, resource: 'brandon'         },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Signage package',                     min: 6,  max: 16, resource: 'brandon'         },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Photo moment design',                 min: 6,  max: 12, resource: 'stef'            },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Giveaway item design',                min: 2,  max: 6,  resource: 'brandon'         },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Social / digital assets',             min: 4,  max: 10, resource: 'julio'           },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Print-ready production files',        min: 3,  max: 8,  resource: 'brandon'         },
  // ── Branding ──
  { projectCategory: 'branding', category: 'graphic_design', name: 'Brand strategy & positioning',           min: 8,  max: 20, resource: 'becky'    },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Logo design',                            min: 12, max: 24, resource: 'becky'    },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Brand identity system',                  min: 20, max: 40, resource: 'becky'    },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Brand guidelines / style guide',         min: 10, max: 24, resource: 'stef'     },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Color & typography system',              min: 4,  max: 10, resource: 'stef'     },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Stationery & collateral design',        min: 6,  max: 14, resource: 'brandon'  },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Brand applications package',             min: 8,  max: 18, resource: 'julio'    },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Packaging design',                       min: 8,  max: 20, resource: 'stef'     },
  // ── Web ──
  { projectCategory: 'web', category: 'graphic_design', name: 'UX / site map & wireframes',                 min: 10, max: 24, resource: 'becky'  },
  { projectCategory: 'web', category: 'graphic_design', name: 'UI design / full mockups',                   min: 16, max: 40, resource: 'stef'   },
  { projectCategory: 'web', category: 'graphic_design', name: 'Landing page design',                         min: 8,  max: 20, resource: 'stef'   },
  { projectCategory: 'web', category: 'graphic_design', name: 'Component library / design system',           min: 20, max: 40, resource: 'julio'  },
  { projectCategory: 'web', category: 'graphic_design', name: 'Front-end development',                       min: 20, max: 60, resource: 'julio'  },
  { projectCategory: 'web', category: 'graphic_design', name: 'Prototype / interaction design',              min: 8,  max: 20, resource: 'stef'   },
  { projectCategory: 'web', category: 'graphic_design', name: 'Mobile / responsive design',                  min: 8,  max: 20, resource: 'stef'   },
  // ── Presentation ──
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Pitch deck design',                  min: 8,  max: 20, resource: 'stef'    },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'PowerPoint / Keynote template',      min: 6,  max: 14, resource: 'brandon' },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Google Slides deck',                 min: 6,  max: 14, resource: 'stef'    },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Infographic design',                 min: 4,  max: 10, resource: 'brandon' },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Report / white paper layout',        min: 6,  max: 16, resource: 'brandon' },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Data visualization / charts',        min: 4,  max: 10, resource: 'julio'   },
  // ── General Design ──
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Social media content (per batch)', min: 2,  max: 6,  resource: 'brandon' },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Email design',                     min: 2,  max: 6,  resource: 'brandon' },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Banner / ad design',               min: 2,  max: 8,  resource: 'brandon' },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'General graphic design',           min: 4,  max: 12, resource: 'stef'    },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Photo editing / retouching',       min: 1,  max: 4,  resource: 'brandon' },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Art direction',                    min: 4,  max: 12, resource: 'becky'   },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Illustration',                     min: 4,  max: 16, resource: 'stef'    },
]
