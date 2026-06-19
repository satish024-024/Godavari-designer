export const defaultSite = {
  theme: {
    ivory: "#F8F6F2",
    surface: "#EFE8DD",
    navy: "#111D42",
    gold: "#C8A15A",
    border: "#E6DED1",
    glass: "rgba(255, 255, 255, 0.68)",
    blush: "#D8A7A0",
    sage: "#8D9B83"
  },
  brand: {
    name: "Godavari Designer",
    tagline: "Precision. Passion. Perfection.",
    descriptor: "Luxury embroidery designs, digitized to perfection for fashion that inspires.",
    trustText: "Trusted by 2,500+ Fashion Brands Worldwide",
    storyLabel: "Watch Our Story",
    qualityTitle: "Premium Quality",
    qualityText: "Machine-Ready Designs",
    contact: {
      email: "hello@godavaridesigner.com",
      phone: "+91 98765 43210",
      address: "Hyderabad, India",
      instagram: "@godavaridesigner"
    }
  },
  navigation: [
    { label: "Collections", target: "collections" },
    { label: "Custom Digitizing", target: "process" },
    { label: "Design Library", target: "best-sellers" },
    { label: "About Us", target: "stories" },
    { label: "Inspiration", target: "cta" },
    { label: "Contact", target: "footer" }
  ],
  hero: {
    eyebrow: "Passion. Perfection.",
    heading: "Embroidery Reimagined",
    subheading: "Custom Digitizing, Luxury Embroidery Designs, Machine-Ready Collections.",
    primaryButton: "Browse Designs",
    secondaryButton: "Request Custom Quote",
    videoUrl: "media-hero-video",
    posterImage: "media-hero-bg",
    note: "Cinematic machine stitching with luxury floral embroidery direction."
  },
  collections: [
    {
      id: "bridal",
      title: "Bridal Collection",
      description: "Heirloom motifs, veil borders and couture wedding details.",
      image: "media-collection-bridal"
    },
    {
      id: "blouses",
      title: "Designer Blouses",
      description: "Back-neck artwork, sleeves and precision blouse placements.",
      image: "media-collection-blouses"
    },
    {
      id: "saree",
      title: "Saree Borders",
      description: "Machine-ready ornate borders for silk, net and organza sarees.",
      image: "media-collection-saree"
    },
    {
      id: "kids",
      title: "Kids Wear",
      description: "Soft festive details for lehengas, frocks and tiny occasionwear.",
      image: "media-collection-kids"
    },
    {
      id: "floral",
      title: "Luxury Floral",
      description: "Dimensional florals, gold vines and elevated botanical patterns.",
      image: "media-collection-floral"
    }
  ],
  steps: [
    {
      title: "Upload Design",
      body: "Upload your artwork, sketch or reference.",
      icon: "upload-cloud"
    },
    {
      title: "Get Quote",
      body: "Receive a custom quote within 24 hours.",
      icon: "receipt-text"
    },
    {
      title: "Approve Sample",
      body: "Review and approve your stitch sample.",
      icon: "badge-check"
    },
    {
      title: "Production",
      body: "Precision embroidery with luxury quality.",
      icon: "factory"
    },
    {
      title: "Delivery",
      body: "Delivered to your doorstep.",
      icon: "package-check"
    }
  ],
  products: [
    {
      id: "royal-peony",
      code: "GD-1028",
      slug: "royal-peony-floral",
      title: "Royal Peony Floral",
      description: "An exquisite royal peony motif designed for luxury blouses and centerpieces.",
      price: 45,
      category: "Luxury Floral",
      collection: "floral",
      image: "media-product-peony",
      gallery: ["media-product-peony", "media-collection-floral"],
      stitchCount: 34500,
      threadColors: 6,
      dimensions: "140mm x 165mm",
      machineFormats: ["DST", "EXP", "PES", "JEF", "XXX"],
      featured: true,
      bestSeller: true,
      tags: ["peony", "floral", "motif", "luxury", "GD-1028"],
      seoTitle: "Royal Peony Floral Design Motif | Godavari",
      seoDescription: "Exquisite royal peony motif design for high-end boutique stitching.",
      createdAt: "2026-06-19T00:00:00.000Z",
      updatedAt: "2026-06-19T00:00:00.000Z",
      width: 140,
      height: 165,
      backStitchCount: 2400,
      handStitchCount: 0,
      totalStitchCount: 34500,
      rpm: 850,
      estimatedEmbroideryTime: 40,
      difficultyLevel: "Intermediate",
      recommendedFabrics: ["Silk", "Organza", "Velvet"],
      formats: [
        { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "200mm x 200mm", price: 45 },
        { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "200mm x 200mm", price: 45 },
        { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "200mm x 200mm", price: 45 },
        { format: "JEF", machineBrand: "Janome", machineModel: "MC550E", hoopSize: "200mm x 200mm", price: 45 },
        { format: "XXX", machineBrand: "Singer", machineModel: "EM9305", hoopSize: "200mm x 200mm", price: 45 }
      ]
    },
    {
      id: "bridal-gold-bloom",
      code: "GD-2041",
      slug: "bridal-gold-bloom",
      title: "Bridal Gold Bloom",
      description: "Heirloom gold flower motif with dimensional details, perfect for lehengas and wedding veils.",
      price: 65,
      category: "Bridal",
      collection: "bridal",
      image: "media-collection-bridal",
      gallery: ["media-collection-bridal"],
      stitchCount: 58000,
      threadColors: 8,
      dimensions: "180mm x 220mm",
      machineFormats: ["DST", "EXP", "PES", "JEF"],
      featured: true,
      bestSeller: true,
      tags: ["bridal", "gold", "bloom", "wedding", "GD-2041"],
      seoTitle: "Bridal Gold Bloom Machine Embroidery Pattern | Godavari",
      seoDescription: "Exquisite bridal gold bloom machine embroidery design with 58,000 stitches.",
      createdAt: "2026-06-18T00:00:00.000Z",
      updatedAt: "2026-06-18T00:00:00.000Z",
      width: 180,
      height: 220,
      backStitchCount: 4800,
      handStitchCount: 0,
      totalStitchCount: 58000,
      rpm: 850,
      estimatedEmbroideryTime: 68,
      difficultyLevel: "Advanced",
      recommendedFabrics: ["Silk", "Net", "Velvet"],
      formats: [
        { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "200mm x 300mm", price: 65 },
        { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "200mm x 300mm", price: 65 },
        { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "200mm x 300mm", price: 65 },
        { format: "JEF", machineBrand: "Janome", machineModel: "MC550E", hoopSize: "200mm x 300mm", price: 65 }
      ]
    },
    {
      id: "designer-vine-border",
      code: "GD-1877",
      slug: "designer-vine-border",
      title: "Designer Vine Border",
      description: "Clean vine border trailing design, highly optimized for sarees and ethnic neck borders.",
      price: 35,
      category: "Borders",
      collection: "saree",
      image: "media-product-floral-vine",
      gallery: ["media-product-floral-vine"],
      stitchCount: 29000,
      threadColors: 4,
      dimensions: "100mm x 300mm",
      machineFormats: ["DST", "PES", "EXP"],
      featured: false,
      bestSeller: true,
      tags: ["vine", "border", "saree", "GD-1877"],
      seoTitle: "Designer Vine Border Saree Design | Godavari",
      seoDescription: "Buy designer vine border embroidery design for boutique saree border stitching.",
      createdAt: "2026-06-17T00:00:00.000Z",
      updatedAt: "2026-06-17T00:00:00.000Z",
      width: 100,
      height: 300,
      backStitchCount: 2000,
      handStitchCount: 0,
      totalStitchCount: 29000,
      rpm: 850,
      estimatedEmbroideryTime: 34,
      difficultyLevel: "Beginner",
      recommendedFabrics: ["Organza", "Net", "Georgette"],
      formats: [
        { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "130mm x 300mm", price: 35 },
        { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "130mm x 300mm", price: 35 },
        { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "130mm x 300mm", price: 35 }
      ]
    },
    {
      id: "regal-paisley-motif",
      code: "GD-3102",
      slug: "regal-paisley-motif",
      title: "Regal Paisley Motif",
      description: "Ornate traditional paisley patch with rich zari embroidery, perfect for ethnic wedding lehengas.",
      price: 42,
      category: "Traditional",
      collection: "bridal",
      image: "media-product-paisley",
      gallery: ["media-product-paisley"],
      stitchCount: 41000,
      threadColors: 5,
      dimensions: "150mm x 180mm",
      machineFormats: ["DST", "EXP", "PES", "JEF"],
      featured: true,
      bestSeller: false,
      tags: ["paisley", "traditional", "ethnic", "zari", "GD-3102"],
      seoTitle: "Regal Paisley Motif Traditional Design | Godavari",
      seoDescription: "Traditional regal paisley patch design with 41,000 stitches.",
      createdAt: "2026-06-16T00:00:00.000Z",
      updatedAt: "2026-06-16T00:00:00.000Z",
      width: 150,
      height: 180,
      backStitchCount: 3800,
      handStitchCount: 0,
      totalStitchCount: 41000,
      rpm: 850,
      estimatedEmbroideryTime: 50,
      difficultyLevel: "Intermediate",
      recommendedFabrics: ["Silk", "Velvet", "Georgette"],
      formats: [
        { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "200mm x 200mm", price: 42 },
        { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "200mm x 200mm", price: 42 },
        { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "200mm x 200mm", price: 42 },
        { format: "JEF", machineBrand: "Janome", machineModel: "MC550E", hoopSize: "200mm x 200mm", price: 42 }
      ]
    },
    {
      id: "kids-floral-garden",
      code: "GD-4058",
      slug: "kids-floral-garden",
      title: "Kids Floral Garden",
      description: "Soft mini floral motifs designed for children occasionwear, lehengas, and tiny borders.",
      price: 36,
      category: "Kids",
      collection: "kids",
      image: "media-collection-kids",
      gallery: ["media-collection-kids"],
      stitchCount: 18000,
      threadColors: 3,
      dimensions: "70mm x 130mm",
      machineFormats: ["DST", "PES", "EXP", "JEF", "XXX"],
      featured: false,
      bestSeller: true,
      tags: ["kids", "floral", "garden", "soft", "GD-4058"],
      seoTitle: "Kids Floral Garden Embroidery Design | Godavari",
      seoDescription: "Soft mini floral garden embroidery design for kids festive dresses.",
      createdAt: "2026-06-15T00:00:00.000Z",
      updatedAt: "2026-06-15T00:00:00.000Z",
      width: 70,
      height: 130,
      backStitchCount: 1200,
      handStitchCount: 0,
      totalStitchCount: 18000,
      rpm: 850,
      estimatedEmbroideryTime: 23,
      difficultyLevel: "Beginner",
      recommendedFabrics: ["Cotton", "Silk", "Organza"],
      formats: [
        { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "100mm x 150mm", price: 36 },
        { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "100mm x 150mm", price: 36 },
        { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "100mm x 150mm", price: 36 },
        { format: "JEF", machineBrand: "Janome", machineModel: "MC550E", hoopSize: "100mm x 150mm", price: 36 },
        { format: "XXX", machineBrand: "Singer", machineModel: "EM9305", hoopSize: "100mm x 150mm", price: 36 }
      ]
    },
    {
      id: "zari-leaf-trail",
      code: "GD-2766",
      slug: "zari-leaf-trail",
      title: "Zari Leaf Trail",
      description: "Traditional zari leaf trail border motif, highly optimized for designer wedding saree borders.",
      price: 39,
      category: "Zari Work",
      collection: "saree",
      image: "media-product-golden-leaf",
      gallery: ["media-product-golden-leaf"],
      stitchCount: 25500,
      threadColors: 3,
      dimensions: "90mm x 200mm",
      machineFormats: ["DST", "PES", "EXP"],
      featured: false,
      bestSeller: false,
      tags: ["zari", "leaf", "trail", "border", "GD-2766"],
      seoTitle: "Zari Leaf Trail Embroidery Border | Godavari",
      seoDescription: "Buy zari leaf border machine embroidery design with 25,500 stitches.",
      createdAt: "2026-06-14T00:00:00.000Z",
      updatedAt: "2026-06-14T00:00:00.000Z",
      width: 90,
      height: 200,
      backStitchCount: 1900,
      handStitchCount: 0,
      totalStitchCount: 25500,
      rpm: 850,
      estimatedEmbroideryTime: 32,
      difficultyLevel: "Intermediate",
      recommendedFabrics: ["Silk", "Georgette", "Organza"],
      formats: [
        { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "100mm x 250mm", price: 39 },
        { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "100mm x 250mm", price: 39 },
        { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "100mm x 250mm", price: 39 }
      ]
    },
    {
      id: "cutwork-elegance",
      code: "GD-3345",
      slug: "cutwork-elegance",
      title: "Cutwork Elegance",
      description: "Heavy cutwork blouse back-neck design pattern with intricate lace borders.",
      price: 55,
      category: "Cutwork",
      collection: "blouses",
      image: "media-product-net",
      gallery: ["media-product-net"],
      stitchCount: 31000,
      threadColors: 5,
      dimensions: "180mm x 200mm",
      machineFormats: ["DST", "EXP", "PES"],
      featured: true,
      bestSeller: true,
      tags: ["cutwork", "blouse", "lace", "GD-3345"],
      seoTitle: "Cutwork Elegance Blouse Back Design | Godavari",
      seoDescription: "Exquisite cutwork pattern back-neck blouse design.",
      createdAt: "2026-06-13T00:00:00.000Z",
      updatedAt: "2026-06-13T00:00:00.000Z",
      width: 180,
      height: 200,
      backStitchCount: 2800,
      handStitchCount: 0,
      totalStitchCount: 31000,
      rpm: 800,
      estimatedEmbroideryTime: 40,
      difficultyLevel: "Advanced",
      recommendedFabrics: ["Net", "Silk", "Organza"],
      formats: [
        { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "200mm x 250mm", price: 55 },
        { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "200mm x 250mm", price: 55 },
        { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "200mm x 250mm", price: 55 }
      ]
    },
    {
      id: "neckline-royal-design",
      code: "GD-5120",
      slug: "neckline-royal-design",
      title: "Neckline Royal Design",
      description: "Regal front-neck and collar embroidery placements with delicate beadwork outlines.",
      price: 48,
      category: "Neckline",
      collection: "blouses",
      image: "media-collection-blouses",
      gallery: ["media-collection-blouses"],
      stitchCount: 22000,
      threadColors: 4,
      dimensions: "150mm x 150mm",
      machineFormats: ["DST", "EXP", "PES", "JEF"],
      featured: false,
      bestSeller: false,
      tags: ["neckline", "royal", "collar", "GD-5120"],
      seoTitle: "Neckline Royal Collar Embroidery Pattern | Godavari",
      seoDescription: "Regal neckline collar embroidery design with 22,000 stitches.",
      createdAt: "2026-06-12T00:00:00.000Z",
      updatedAt: "2026-06-12T00:00:00.000Z",
      width: 150,
      height: 150,
      backStitchCount: 1600,
      handStitchCount: 0,
      totalStitchCount: 22000,
      rpm: 850,
      estimatedEmbroideryTime: 28,
      difficultyLevel: "Intermediate",
      recommendedFabrics: ["Silk", "Cotton", "Georgette"],
      formats: [
        { format: "DST", machineBrand: "Tajima", machineModel: "TMEZ-SC", hoopSize: "200mm x 200mm", price: 48 },
        { format: "PES", machineBrand: "Brother", machineModel: "PR1055X", hoopSize: "200mm x 200mm", price: 48 },
        { format: "EXP", machineBrand: "Bernina", machineModel: "E16", hoopSize: "200mm x 200mm", price: 48 },
        { format: "JEF", machineBrand: "Janome", machineModel: "MC550E", hoopSize: "200mm x 200mm", price: 48 }
      ]
    }
  ],
  stories: {
    quote: "Godavari transformed our ideas into exquisite embroidery that elevates our entire collection.",
    person: "Neha Mehta",
    role: "Designer, Delhi",
    rating: "5.0",
    clients: [
      {
        name: "House of Anaya",
        type: "Fashion House",
        quote: "The sampling quality made approvals effortless.",
        image: "media-client-1"
      },
      {
        name: "Label Neha",
        type: "Designer Label",
        quote: "Digitizing felt exact, refined and ready for production.",
        image: "media-client-2"
      },
      {
        name: "Saaz Couture",
        type: "Couture Studio",
        quote: "Our bridal pieces now carry a richer finish.",
        image: "media-client-3"
      },
      {
        name: "Ivy & Oak Designs",
        type: "Boutique",
        quote: "A calm, premium experience from quote to delivery.",
        image: "media-client-4"
      },
      {
        name: "Meera Bridals",
        type: "Bridal Atelier",
        quote: "Every motif arrived production-ready.",
        image: "media-client-5"
      }
    ]
  },
  cta: {
    headline: "Bring Your Embroidery Vision To Life",
    text: "Transform ideas into precision embroidery crafted for fashion brands, boutiques and designers.",
    primaryButton: "Request Custom Quote",
    secondaryButton: "Browse Collections",
    image: "media-cta-bg"
  },
  footer: {
    columns: [
      {
        title: "Shop",
        links: ["All Collections", "Best Sellers", "New Arrivals", "Design Library", "Custom Digitizing"]
      },
      {
        title: "Company",
        links: ["About Us", "Our Process", "Why Godavari", "Reviews", "Careers"]
      },
      {
        title: "Support",
        links: ["FAQs", "Shipping & Delivery", "Returns & Refunds", "Terms of Service", "Privacy Policy"]
      }
    ],
    newsletterTitle: "Stay Inspired",
    newsletterText: "Subscribe to get updates on new designs, offers and embroidery inspirations."
  }
};
export const faqs = [
  { id: "faq-1", question: "What formats do the machine-ready files come in?", answer: "We support DST, EXP, PES, JEF, and XXX formats. You can download all or any format after purchasing.", category: "Formats" },
  { id: "faq-2", question: "What is your turnaround time for custom digitizing?", answer: "Custom digitizing designs are reviewed, quoted, and sampled within 24-48 hours.", category: "Digitizing" },
  { id: "faq-3", question: "Do you supply physical samples of designs?", answer: "No, we provide high-resolution digital stitch-out rendering files and video previews. Once approved, the digital files are ready for production on your machine.", category: "Sampling" },
  { id: "faq-4", question: "How do I download my purchases?", answer: "Once payment is verified, you can download files directly from your order tracking screen or user profile area.", category: "Orders" }
];
