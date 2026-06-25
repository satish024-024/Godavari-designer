import { site, getCategories, createCategory, updateCategory, deleteCategory } from "../services/store.js";
import { escapeHtml, attr, icon, mediaUrl } from "../utils/helpers.js";

// CMS Tab & Form State
export let adminTab = "content"; // "content" | "categories"
export let editingCategoryId = null; // category being edited
export let isCreating = false; // flag to show add form
export let targetParentId = null; // pre-select parent ID when adding subcategory

function adminInput(label, name, value, placeholder = "") {
  return `
    <label class="admin-field">
      <span>${escapeHtml(label)}</span>
      <input name="${attr(name)}" value="${attr(value)}" placeholder="${attr(placeholder)}" required />
    </label>
  `;
}

function adminTextarea(label, name, value, placeholder = "") {
  return `
    <label class="admin-field">
      <span>${escapeHtml(label)}</span>
      <textarea name="${attr(name)}" rows="3" placeholder="${attr(placeholder)}" required>${escapeHtml(value)}</textarea>
    </label>
  `;
}

function renderMediaAdminRows() {
  const rows = [
    { label: "Hero video", path: "hero.videoUrl", value: site.hero.videoUrl, preview: site.hero.posterImage },
    { label: "Hero poster", path: "hero.posterImage", value: site.hero.posterImage, preview: site.hero.posterImage },
    { label: "CTA image", path: "cta.image", value: site.cta.image, preview: site.cta.image },
    ...site.collections.map((item, index) => ({
      label: `Collection: ${item.title}`,
      path: `collections.${index}.image`,
      value: item.image,
      preview: item.image
    })),
    ...site.products.map((item, index) => ({
      label: `Product: ${item.title}`,
      path: `products.${index}.image`,
      value: item.image,
      preview: item.image
    })),
    ...site.stories.clients.map((item, index) => ({
      label: `Story: ${item.name}`,
      path: `stories.clients.${index}.image`,
      value: item.image,
      preview: item.image
    }))
  ];

  return rows
    .map(
      (row) => `
        <label class="media-field" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; width: 100%; box-sizing: border-box;">
          <img class="media-row-preview" src="${attr(mediaUrl(row.preview))}" alt="" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); flex-shrink: 0;" />
          <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0;">
            <span style="font-weight: 600; display: block; font-size: 13px; color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(row.label)}</span>
            <input type="file" class="media-row-upload" data-path="${attr(row.path)}" accept="image/*" style="font-size: 11px; width: 100%; color: var(--navy);" />
            <input type="hidden" data-setting="${attr(row.path)}" value="${attr(row.value)}" />
          </div>
        </label>
      `
    )
    .join("");
}

export function renderAdminDrawer() {
  const json = JSON.stringify(site, null, 2);
  const cats = getCategories();

  // Sort parent categories and their subcategories by displayOrder
  const parentCats = cats.filter(c => !c.parentCategoryId).sort((a, b) => a.displayOrder - b.displayOrder);
  const subCats = cats.filter(c => c.parentCategoryId).sort((a, b) => a.displayOrder - b.displayOrder);

  let tabContent = "";

  if (adminTab === "content") {
    tabContent = `
      <div class="admin-content-tab">
        <section class="admin-section">
          <h3>Brand</h3>
          <label class="admin-field">
            <span>Website name</span>
            <input data-setting="brand.name" value="${attr(site.brand.name)}" />
          </label>
          <label class="admin-field">
            <span>Tagline</span>
            <input data-setting="brand.tagline" value="${attr(site.brand.tagline)}" />
          </label>
          <label class="admin-field">
            <span>Descriptor</span>
            <textarea data-setting="brand.descriptor" rows="3">${escapeHtml(site.brand.descriptor)}</textarea>
          </label>
        </section>
        <section class="admin-section">
          <h3>Contact</h3>
          <label class="admin-field">
            <span>Email</span>
            <input data-setting="brand.contact.email" value="${attr(site.brand.contact.email)}" />
          </label>
          <label class="admin-field">
            <span>Phone</span>
            <input data-setting="brand.contact.phone" value="${attr(site.brand.contact.phone)}" />
          </label>
          <label class="admin-field">
            <span>Address</span>
            <input data-setting="brand.contact.address" value="${attr(site.brand.contact.address)}" />
          </label>
        </section>
        <section class="admin-section">
          <h3>Colors</h3>
          <div class="color-grid">
            ${Object.entries(site.theme)
              .filter(([, value]) => String(value).startsWith("#"))
              .map(
                ([key, value]) => `
                  <label>
                    <span>${escapeHtml(key)}</span>
                    <input type="color" data-setting="theme.${attr(key)}" value="${attr(value)}" />
                  </label>
                `
              )
              .join("")}
          </div>
        </section>
        <section class="admin-section wide-admin">
          <h3>Media Library</h3>
          <div class="media-admin-grid">
            ${renderMediaAdminRows()}
          </div>
        </section>
        <section class="admin-section wide-admin">
          <h3>Full Content JSON</h3>
          <textarea id="siteJsonEditor" class="json-editor" spellcheck="false">${escapeHtml(json)}</textarea>
        </section>
      </div>
    `;
  } else if (adminTab === "categories") {
    // Check if showing Form (Edit or Add mode)
    if (isCreating || editingCategoryId) {
      const isEdit = !!editingCategoryId;
      const cat = isEdit ? cats.find(c => c.id === editingCategoryId) : null;
      
      const formTitle = isEdit ? `Edit Category: ${cat.name}` : (targetParentId ? `Add Subcategory` : `Create Category`);
      const parentSelectId = isEdit ? cat.parentCategoryId : targetParentId;

      tabContent = `
        <form id="categoryForm" class="admin-section" style="display: grid; gap: 16px;">
          <h3>${escapeHtml(formTitle)}</h3>
          
          <label class="admin-field">
            <span>Parent Category</span>
            <select name="parentCategoryId" class="format-dropdown">
              <option value="">None (Make Parent Category)</option>
              ${parentCats
                .map(
                  (p) => `
                    <option value="${attr(p.id)}" ${parentSelectId === p.id ? "selected" : ""}>
                      ${escapeHtml(p.name)}
                    </option>
                  `
                )
                .join("")}
            </select>
          </label>

          ${adminInput("Category Name", "name", isEdit ? cat.name : "", "e.g. Peacock motif")}
          ${adminInput("Slug (URL parameter)", "slug", isEdit ? cat.slug : "", "e.g. peacock-motif")}
          <label class="admin-field">
            <span>Cover Image</span>
            <div class="image-upload-card" style="border: 2px dashed var(--border); border-radius: 8px; padding: 16px; text-align: center; background: #fff; cursor: pointer; transition: border-color 0.2s; position: relative; margin-top: 6px;">
              <input type="file" class="category-image-upload" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
              <div class="upload-placeholder" style="${isEdit && cat.image ? 'display: none;' : 'display: flex; flex-direction: column; align-items: center; gap: 6px;'}">
                ${icon("upload-cloud", 24)}
                <span style="font-size: 12px; font-weight: 500; color: var(--navy);">Click or drag image to upload cover</span>
              </div>
              <div class="upload-preview cover-image-preview-container" style="${isEdit && cat.image ? 'display: flex; flex-direction: column; align-items: center; gap: 6px;' : 'display: none;'}">
                <img src="${isEdit && cat.image ? attr(mediaUrl(cat.image)) : ''}" style="max-height: 80px; max-width: 100%; object-fit: contain; border-radius: 4px; border: 1px solid var(--border);">
                <span style="font-size: 11px; color: var(--gold); font-weight: 600;">Click to replace cover</span>
              </div>
              <input type="hidden" name="image" value="${attr(isEdit ? cat.image : 'media-collection-bridal')}" required />
            </div>
          </label>
          <label class="admin-field">
            <span>Banner Image</span>
            <div class="image-upload-card" style="border: 2px dashed var(--border); border-radius: 8px; padding: 16px; text-align: center; background: #fff; cursor: pointer; transition: border-color 0.2s; position: relative; margin-top: 6px;">
              <input type="file" class="category-banner-upload" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
              <div class="upload-placeholder" style="${isEdit && cat.bannerImage ? 'display: none;' : 'display: flex; flex-direction: column; align-items: center; gap: 6px;'}">
                ${icon("upload-cloud", 24)}
                <span style="font-size: 12px; font-weight: 500; color: var(--navy);">Click or drag image to upload banner</span>
              </div>
              <div class="upload-preview banner-image-preview-container" style="${isEdit && cat.bannerImage ? 'display: flex; flex-direction: column; align-items: center; gap: 6px;' : 'display: none;'}">
                <img src="${isEdit && cat.bannerImage ? attr(mediaUrl(cat.bannerImage)) : ''}" style="max-height: 80px; max-width: 100%; object-fit: contain; border-radius: 4px; border: 1px solid var(--border);">
                <span style="font-size: 11px; color: var(--gold); font-weight: 600;">Click to replace banner</span>
              </div>
              <input type="hidden" name="bannerImage" value="${attr(isEdit ? cat.bannerImage : 'media-collection-bridal')}" required />
            </div>
          </label>
          ${adminTextarea("Description", "description", isEdit ? cat.description : "", "Enter collection descriptions...")}
          
          <label class="admin-field" style="flex-direction: row; gap: 12px; align-items: center;">
            <input type="checkbox" name="featured" ${isEdit && cat.featured ? "checked" : ""} style="width: 18px; height: 18px; accent-color: var(--gold);" />
            <span>Featured Category (Show on Homepage / Highlights)</span>
          </label>

          <hr style="border:0; border-top: 1px solid var(--border); margin: 8px 0;" />
          <strong>SEO Meta tags</strong>
          ${adminInput("SEO Title", "seoTitle", isEdit ? cat.seoTitle : "", "SEO friendly title tag")}
          ${adminInput("SEO Description", "seoDescription", isEdit ? cat.seoDescription : "", "SEO meta description snippet")}
          
          <label class="admin-field">
            <span>Display Order</span>
            <input type="number" name="displayOrder" value="${isEdit ? cat.displayOrder : parentCats.length + 1}" required />
          </label>

          <div style="display: flex; gap: 12px; margin-top: 10px;">
            <button type="submit" class="button button-primary" style="flex:1; min-height: 44px; font-size:14px;">
              <span>${isEdit ? "Update Category" : "Create Category"}</span>
            </button>
            <button type="button" class="button button-secondary" data-action="cancel-category-form" style="flex:1; min-height: 44px; font-size:14px;">
              Cancel
            </button>
          </div>
        </form>
      `;
    } else {
      // List Mode
      tabContent = `
        <div class="admin-categories-cms" style="display:grid; gap: 20px;">
          <div style="display:flex; justify-content: space-between; align-items:center;">
            <h3>Categories List</h3>
            <button type="button" class="button button-primary" data-action="add-category-btn" style="min-height:36px; padding:0 14px; font-size:13px;">
              ${icon("plus", 16)} Add Category
            </button>
          </div>

          <div class="category-cms-tree" style="display: grid; gap: 14px;">
            ${parentCats
              .map((parent) => {
                const childs = subCats.filter((s) => s.parentCategoryId === parent.id);
                return `
                  <div class="cms-parent-card" style="border: 1px solid var(--border); border-radius: 6px; padding: 16px; background: rgba(255,255,255,0.3);">
                    <div style="display:flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                      <div>
                        <strong style="font-size: 16px; color: var(--navy);">${escapeHtml(parent.name)}</strong>
                        <span style="font-size:12px; color:var(--gold); margin-left: 10px;">${parent.featured ? "Featured" : ""} (Order: ${parent.displayOrder})</span>
                      </div>
                      <div style="display:flex; gap: 6px;">
                        <button type="button" class="icon-button" data-action="add-subcategory-btn" data-parent-id="${parent.id}" title="Add Subcategory" style="width:28px; height:28px;">
                          ${icon("plus-circle", 14)}
                        </button>
                        <button type="button" class="icon-button" data-action="edit-category-btn" data-id="${parent.id}" title="Edit" style="width:28px; height:28px;">
                          ${icon("pencil", 13)}
                        </button>
                        <button type="button" class="icon-button" data-action="reorder-category-up" data-id="${parent.id}" title="Move Up" style="width:28px; height:28px;">
                          ${icon("arrow-up", 13)}
                        </button>
                        <button type="button" class="icon-button" data-action="reorder-category-down" data-id="${parent.id}" title="Move Down" style="width:28px; height:28px;">
                          ${icon("arrow-down", 13)}
                        </button>
                        <button type="button" class="icon-button" data-action="delete-category-btn" data-id="${parent.id}" title="Delete" style="width:28px; height:28px; border-color: rgba(220,53,69,0.3); color: #dc3545;">
                          ${icon("trash-2", 13)}
                        </button>
                      </div>
                    </div>

                    ${
                      childs.length > 0
                        ? `<div class="cms-subcategories-list" style="margin-top: 10px; display: grid; gap: 8px; padding-left: 20px; border-left: 2px solid var(--border);">
                            ${childs
                              .map(
                                (child) => `
                                  <div style="display:flex; justify-content: space-between; align-items: center; font-size:13px; padding: 4px 0;">
                                    <span>${escapeHtml(child.name)} <span style="font-size:11px; color:var(--ink-soft);">(${child.slug})</span></span>
                                    <div style="display:flex; gap: 4px;">
                                      <button type="button" class="icon-button" data-action="edit-category-btn" data-id="${child.id}" title="Edit" style="width:24px; height:24px; padding:0;">
                                        ${icon("pencil", 11)}
                                      </button>
                                      <button type="button" class="icon-button" data-action="reorder-category-up" data-id="${child.id}" title="Move Up" style="width:24px; height:24px; padding:0;">
                                        ${icon("arrow-up", 11)}
                                      </button>
                                      <button type="button" class="icon-button" data-action="reorder-category-down" data-id="${child.id}" title="Move Down" style="width:24px; height:24px; padding:0;">
                                        ${icon("arrow-down", 11)}
                                      </button>
                                      <button type="button" class="icon-button" data-action="delete-category-btn" data-id="${child.id}" title="Delete" style="width:24px; height:24px; padding:0; border-color: rgba(220,53,69,0.3); color: #dc3545;">
                                        ${icon("trash-2", 11)}
                                      </button>
                                    </div>
                                  </div>
                                `
                              )
                              .join("")}
                          </div>`
                        : `<p style="font-size: 12px; color: var(--ink-soft); margin-top: 8px; font-style: italic;">No subcategories added.</p>`
                    }
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      `;
    }
  }

  return `
    <div class="drawer-layer admin-layer" role="dialog" aria-modal="true" aria-label="Admin customization">
      <div class="overlay-scrim" data-action="close-panels"></div>
      <aside class="admin-drawer">
        <div class="drawer-header" style="border-bottom:none; padding-bottom: 0;">
          <div>
            <span>Admin Studio</span>
            <h2>Customize Settings</h2>
          </div>
          <button type="button" class="icon-button" data-action="close-panels" aria-label="Close admin">${icon("x", 22)}</button>
        </div>

        <!-- CMS Tab Navigation -->
        <div class="admin-tabs" style="display:flex; border-bottom: 1px solid var(--border); margin: 16px 24px 0; padding-bottom: 8px; gap: 16px;">
          <button type="button" class="nav-link" data-action="set-admin-tab" data-tab="content" style="padding:4px 0; font-size: 13px; cursor:pointer; font-weight:700; ${adminTab === "content" ? "color: var(--gold);" : "color: var(--ink-soft);"}"}>
            Homepage Content
          </button>
          <button type="button" class="nav-link" data-action="set-admin-tab" data-tab="categories" style="padding:4px 0; font-size: 13px; cursor:pointer; font-weight:700; ${adminTab === "categories" ? "color: var(--gold);" : "color: var(--ink-soft);"}"}>
            Manage Categories
          </button>
        </div>

        <div class="admin-content" style="padding-top: 14px;">
          ${tabContent}
        </div>
        
        ${
          adminTab === "content"
            ? `<div class="admin-actions">
                <button type="button" class="admin-button" data-action="reset-site">${icon("rotate-ccw", 17)} Reset</button>
                <button type="button" class="admin-button" data-action="export-site">${icon("download", 17)} Export</button>
                <button type="button" class="admin-button" data-action="apply-json">${icon("braces", 17)} Apply JSON</button>
                <button type="button" class="admin-button primary" data-action="save-admin">${icon("save", 17)} Done</button>
              </div>`
            : ""
        }
      </aside>
    </div>
  `;
}

// Set state setter methods
export function setAdminTab(tab) {
  adminTab = tab;
  isCreating = false;
  editingCategoryId = null;
  targetParentId = null;
}

export function showCreateCategoryForm(parentId = null) {
  isCreating = true;
  editingCategoryId = null;
  targetParentId = parentId;
}

export function showEditCategoryForm(id) {
  editingCategoryId = id;
  isCreating = false;
  targetParentId = null;
}

export function cancelCategoryForm() {
  isCreating = false;
  editingCategoryId = null;
  targetParentId = null;
}
