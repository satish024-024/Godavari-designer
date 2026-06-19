// Media Library registry map
const MEDIA_REGISTRY_KEY = "godavari-designer-media-v1";

const defaultMedia = {
  "media-hero-bg": {
    id: "media-hero-bg",
    url: "https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=1200&q=70",
    title: "Cinematic floral embroidery hero poster",
    type: "image"
  },
  "media-hero-video": {
    id: "media-hero-video",
    url: "./Embroidery_machine_stitching_flo_202606191150.mp4",
    title: "Luxury stitching background video",
    type: "video"
  },
  "media-collection-bridal": {
    id: "media-collection-bridal",
    url: "https://images.pexels.com/photos/14111325/pexels-photo-14111325.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Bridal Collection cover design",
    type: "image"
  },
  "media-collection-blouses": {
    id: "media-collection-blouses",
    url: "https://images.pexels.com/photos/29119826/pexels-photo-29119826.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Designer Blouses cover design",
    type: "image"
  },
  "media-collection-saree": {
    id: "media-collection-saree",
    url: "https://images.pexels.com/photos/32441377/pexels-photo-32441377.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Saree Borders cover design",
    type: "image"
  },
  "media-collection-kids": {
    id: "media-collection-kids",
    url: "https://images.pexels.com/photos/29199351/pexels-photo-29199351.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Kids Wear cover design",
    type: "image"
  },
  "media-collection-floral": {
    id: "media-collection-floral",
    url: "https://images.pexels.com/photos/10566050/pexels-photo-10566050.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Luxury Floral cover design",
    type: "image"
  },
  "media-product-peony": {
    id: "media-product-peony",
    url: "https://images.pexels.com/photos/10566050/pexels-photo-10566050.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Royal Peony Motif design detail",
    type: "image"
  },
  "media-product-floral-vine": {
    id: "media-product-floral-vine",
    url: "https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Floral Vine Border design detail",
    type: "image"
  },
  "media-product-paisley": {
    id: "media-product-paisley",
    url: "https://images.pexels.com/photos/12715935/pexels-photo-12715935.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Regal Paisley Patch design detail",
    type: "image"
  },
  "media-product-net": {
    id: "media-product-net",
    url: "https://images.pexels.com/photos/10542570/pexels-photo-10542570.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Luxury Net Embroidery design detail",
    type: "image"
  },
  "media-product-golden-leaf": {
    id: "media-product-golden-leaf",
    url: "https://images.pexels.com/photos/37218091/pexels-photo-37218091.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Golden Leaf Trail design detail",
    type: "image"
  },
  "media-cta-bg": {
    id: "media-cta-bg",
    url: "https://images.pexels.com/photos/10542570/pexels-photo-10542570.jpeg?auto=compress&cs=tinysrgb&w=1800",
    title: "Custom digitizing background image",
    type: "image"
  },
  "media-client-1": {
    id: "media-client-1",
    url: "https://images.pexels.com/photos/29119826/pexels-photo-29119826.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "House of Anaya team profile",
    type: "image"
  },
  "media-client-2": {
    id: "media-client-2",
    url: "https://images.pexels.com/photos/32441377/pexels-photo-32441377.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Label Neha office view",
    type: "image"
  },
  "media-client-3": {
    id: "media-client-3",
    url: "https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Saaz Couture wedding client",
    type: "image"
  },
  "media-client-4": {
    id: "media-client-4",
    url: "https://images.pexels.com/photos/10542570/pexels-photo-10542570.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Ivy & Oak designs studio",
    type: "image"
  },
  "media-client-5": {
    id: "media-client-5",
    url: "https://images.pexels.com/photos/14111325/pexels-photo-14111325.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Meera Bridals runway profile",
    type: "image"
  }
};

export const MediaLibrary = {
  load() {
    try {
      const data = localStorage.getItem(MEDIA_REGISTRY_KEY);
      const registry = data ? JSON.parse(data) : defaultMedia;
      // Auto-migrate old mixkit URL to local fallback video
      let needsSave = false;
      if (registry["media-hero-video"] && registry["media-hero-video"].url.includes("mixkit.co")) {
        registry["media-hero-video"].url = "./Embroidery_machine_stitching_flo_202606191150.mp4";
        needsSave = true;
      }
      // Auto-migrate old hero bg url to optimized poster url
      if (registry["media-hero-bg"] && registry["media-hero-bg"].url.includes("w=2200")) {
        registry["media-hero-bg"].url = "https://images.pexels.com/photos/6045282/pexels-photo-6045282.jpeg?auto=compress&cs=tinysrgb&w=1200&q=70";
        needsSave = true;
      }
      if (needsSave) {
        localStorage.setItem(MEDIA_REGISTRY_KEY, JSON.stringify(registry));
      }
      return registry;
    } catch {
      return defaultMedia;
    }
  },
  save(registry) {
    localStorage.setItem(MEDIA_REGISTRY_KEY, JSON.stringify(registry));
  },
  getMedia(id) {
    const registry = this.load();
    return registry[id] || null;
  },
  getMediaUrl(id, fallback = "") {
    const media = this.getMedia(id);
    return media ? media.url : fallback;
  },
  addMedia(id, url, title = "", type = "image") {
    const registry = this.load();
    registry[id] = { id, url, title, type };
    this.save(registry);
    return registry[id];
  },
  listMedia() {
    return Object.values(this.load());
  }
};
