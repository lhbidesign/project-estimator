export const STUDIO_RATE = 150
export const PM_RATE     = 45

export const RESOURCES = {
  brandon:         { label: 'Brandon',           title: 'Designer',              billedRate: 150, internalRate: 55  },
  stef:            { label: 'Stef',              title: 'Senior Designer',       billedRate: 150, internalRate: 65  },
  julio:           { label: 'Julio',             title: 'Designer',              billedRate: 150, internalRate: 65  },
  becky:           { label: 'Becky',             title: 'Creative Director',     billedRate: 150, internalRate: 75  },
  mostafa_general: { label: 'Mostafa – General', title: '3D / Rendering',        billedRate: 150, internalRate: 45  },
  mostafa_oncall:  { label: 'Mostafa – On-Call', title: '3D / On-Call',          billedRate: 200, internalRate: 100 },
}

export const CATEGORIES = [
  {
    id: 'experiential',
    label: 'Experiential',
    deliverables: [
      'Creative Direction & Concepting',
      'Space Planning / Layout',
      'Environmental Graphics',
      'Signage Package',
      'Vehicle / Asset Wrap',
      'Floor Graphics',
      'Photo Moment Design',
      'Giveaway Item Design',
      'On-Site Art Direction',
      'Fabrication Oversight',
      'Print-Ready Production Files',
      'Custom line item',
    ],
  },
  {
    id: 'renderings',
    label: 'Experiential — 3D & Rendering',
    deliverables: [
      'Aerial Full-Footprint Rendering',
      'Individual Element Rendering',
      'General 3D Modeling / Design',
      'On-Call / Rush Rendering',
      'Custom line item',
    ],
  },
  {
    id: 'web',
    label: 'Website',
    deliverables: [
      'UX Research & Discovery',
      'Sitemap / Information Architecture',
      'Wireframes',
      'UI Design — Full Site',
      'UI Design — Landing Page',
      'Mobile / Responsive Design',
      'Component Library / Design System',
      'Prototype / Interaction Design',
      'Webflow Development',
      'WordPress Development',
      'Front-End Development',
      'CMS Setup & Training',
      'SEO Setup & Launch',
      'Custom line item',
    ],
  },
  {
    id: 'presentation',
    label: 'Presentation',
    deliverables: [
      'Pitch Deck Design',
      'PowerPoint / Keynote Template',
      'Google Slides Deck',
      'Infographic Design',
      'Report / White Paper Layout',
      'Data Visualization / Charts',
      'Custom line item',
    ],
  },
  {
    id: 'branding',
    label: 'Branding',
    deliverables: [
      'Brand Strategy & Positioning',
      'Logo Design',
      'Brand Identity System',
      'Brand Guidelines / Style Guide',
      'Color & Typography System',
      'Stationery & Collateral Design',
      'Brand Applications Package',
      'Packaging Design',
      'Custom line item',
    ],
  },
  {
    id: 'graphic_design',
    label: 'General Design',
    deliverables: [
      'Art Direction',
      'Social Media Content',
      'Email Design',
      'Banner / Ad Design',
      'Print Design',
      'Illustration',
      'Photo Editing / Retouching',
      'General Graphic Design',
      'Custom line item',
    ],
  },
]

export const PROJECT_CATEGORIES = [
  { id: 'experiential',   label: 'Experiential'     },
  { id: 'branding',       label: 'Branding'         },
  { id: 'web',            label: 'Web Design & Dev' },
  { id: 'presentation',   label: 'Presentation'     },
  { id: 'general_design', label: 'General Design'   },
]

// Billing rate used in the Service Hour/Cost Guide (reference guide, not estimator calculations)
export const CATEGORY_RATES = {
  experiential:   150,
  branding:       200,
  web:            200,
  presentation:   150,
  general_design: 150,
}

// hours = avg estimate
export const HOUR_GUIDES = [
  // ── Experiential ──
  { projectCategory: 'experiential', category: 'renderings',     name: 'Aerial full-footprint rendering',    hours: 24, resource: 'mostafa_general' },
  { projectCategory: 'experiential', category: 'renderings',     name: 'Individual element rendering',        hours: 8,  resource: 'mostafa_general' },
  { projectCategory: 'experiential', category: 'renderings',     name: 'General 3D modeling / design',        hours: 16, resource: 'mostafa_general' },
  { projectCategory: 'experiential', category: 'renderings',     name: 'On-call / rush rendering',            hours: 5,  resource: 'mostafa_oncall'  },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Design direction / concepting',       hours: 12, resource: 'becky'           },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Vehicle / asset wrap',                hours: 13, resource: 'julio'           },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Floor graphics',                      hours: 7,  resource: 'brandon'         },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Signage package',                     hours: 11, resource: 'brandon'         },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Photo moment design',                 hours: 9,  resource: 'stef'            },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Giveaway item design',                hours: 4,  resource: 'brandon'         },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Social / digital assets',             hours: 7,  resource: 'julio'           },
  { projectCategory: 'experiential', category: 'graphic_design', name: 'Print-ready production files',        hours: 6,  resource: 'brandon'         },
  // ── Branding ──
  { projectCategory: 'branding', category: 'graphic_design', name: 'Brand strategy & positioning',           hours: 14, resource: 'becky'    },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Logo design',                            hours: 18, resource: 'becky'    },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Brand identity system',                  hours: 30, resource: 'becky'    },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Brand guidelines / style guide',         hours: 17, resource: 'stef'     },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Color & typography system',              hours: 7,  resource: 'stef'     },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Stationery & collateral design',        hours: 10, resource: 'brandon'  },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Brand applications package',             hours: 13, resource: 'julio'    },
  { projectCategory: 'branding', category: 'graphic_design', name: 'Packaging design',                       hours: 14, resource: 'stef'     },
  // ── Web ──
  { projectCategory: 'web', category: 'graphic_design', name: 'UX / site map & wireframes',                 hours: 17, resource: 'becky'  },
  { projectCategory: 'web', category: 'graphic_design', name: 'UI design / full mockups',                   hours: 28, resource: 'stef'   },
  { projectCategory: 'web', category: 'graphic_design', name: 'Landing page design',                         hours: 14, resource: 'stef'   },
  { projectCategory: 'web', category: 'graphic_design', name: 'Component library / design system',           hours: 30, resource: 'julio'  },
  { projectCategory: 'web', category: 'graphic_design', name: 'Front-end development',                       hours: 40, resource: 'julio'  },
  { projectCategory: 'web', category: 'graphic_design', name: 'Prototype / interaction design',              hours: 14, resource: 'stef'   },
  { projectCategory: 'web', category: 'graphic_design', name: 'Mobile / responsive design',                  hours: 14, resource: 'stef'   },
  // ── Presentation ──
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Pitch deck design',                  hours: 14, resource: 'stef'    },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'PowerPoint / Keynote template',      hours: 10, resource: 'brandon' },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Google Slides deck',                 hours: 10, resource: 'stef'    },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Infographic design',                 hours: 7,  resource: 'brandon' },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Report / white paper layout',        hours: 11, resource: 'brandon' },
  { projectCategory: 'presentation', category: 'graphic_design', name: 'Data visualization / charts',        hours: 7,  resource: 'julio'   },
  // ── General Design ──
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Social media content (per batch)', hours: 4,  resource: 'brandon' },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Email design',                     hours: 4,  resource: 'brandon' },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Banner / ad design',               hours: 5,  resource: 'brandon' },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'General graphic design',           hours: 8,  resource: 'stef'    },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Photo editing / retouching',       hours: 3,  resource: 'brandon' },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Art direction',                    hours: 8,  resource: 'becky'   },
  { projectCategory: 'general_design', category: 'graphic_design', name: 'Illustration',                     hours: 10, resource: 'stef'    },
]
