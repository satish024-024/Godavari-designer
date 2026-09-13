import { icon, escapeHtml, attr, money } from "../utils/helpers.js";
import { showToast, site, recordLocalWrite, triggerRender } from "../services/store.js";
import { DB } from "../services/db.js";
import { productService } from "../services/supabase.js";

// State for the quick uploader
let quickSelectedImage = null; // { file, base64, previewUrl, filename, contentType }
let quickSelectedMachineFile = null; // { file, base64, filename, contentType, size }
let quickIsSubmitting = false;
let quickUploadProgress = "";
let quickPublishedProduct = null;

export function renderQuickUpload() {
  const categories = [
    "Blouse Designs",
    "Bridal Lehengas",
    "Sarees & Drapes",
    "Kurti Embroidery",
    "Zari Borders & Necklines",
    "Allover Heavy Maggam",
    "Kids & Traditional Wear",
    "Dupattas & Shawls"
  ];

  return `
    <div class="quick-upload-wrapper" style="max-width: 820px; margin: 0 auto; padding: 20px 16px 60px;">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #111D42 0%, #1a2a5e 100%); border-radius: 16px; padding: 28px 32px; color: #fff; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(17,29,66,0.12); position: relative; overflow: hidden;">
        <div style="position: absolute; right: -20px; bottom: -20px; opacity: 0.1; transform: rotate(-15deg);">
          ${icon("upload-cloud", 140)}
        </div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <span style="background: rgba(212,175,55,0.2); color: #d4af37; border: 1px solid rgba(212,175,55,0.4); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            Sanity Cloud Active
          </span>
          <span style="font-size: 12px; color: rgba(255,255,255,0.65);">Project: 6l7i886u • Dataset: production</span>
        </div>
        <h1 style="font-family: var(--font-serif); font-size: 28px; margin: 0 0 8px; color: #fff; font-weight: 700;">
          Quick Design Uploader
        </h1>
        <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin: 0; max-width: 600px; line-height: 1.5;">
          Upload your embroidery files easily. Simply enter the title, choose a category, and upload your design image and machine file. It will be stored on Sanity Cloud and immediately visible on the website!
        </p>
      </div>

      <!-- Success Notification Card (if product just published) -->
      ${quickPublishedProduct ? `
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${attr(quickPublishedProduct.image)}" style="width: 64px; height: 64px; object-fit: contain; background: #fff; border-radius: 8px; border: 1px solid #bbf7d0;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #15803d; background: #dcfce7; padding: 2px 8px; border-radius: 4px;">${escapeHtml(quickPublishedProduct.code)}</span>
                <strong style="font-size: 16px; color: #166534;">${escapeHtml(quickPublishedProduct.title)}</strong>
              </div>
              <span style="font-size: 13px; color: #15803d; margin-top: 4px; display: block;">
                ✓ Successfully published to Sanity CDN and Live Catalog!
              </span>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="#/product/${attr(quickPublishedProduct.slug)}" class="button" style="background: #166534; color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
              ${icon("external-link", 14)} View on Website
            </a>
            <button type="button" id="quickUploadAnotherBtn" class="button button-secondary" style="padding: 8px 16px; font-size: 13px; font-weight: 600;">
              + Upload Another
            </button>
          </div>
        </div>
      ` : ""}

      <!-- Simplified Upload Form -->
      <form id="quickUploadForm" style="background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);" onsubmit="event.preventDefault(); return false;">
        
        <!-- Field 1: Title -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 13.5px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">
            1. Design Title / File Name <span style="color: #dc2626;">*</span>
          </label>
          <input 
            type="text" 
            id="quickTitle" 
            name="title" 
            placeholder="e.g. Royal Peacock Maggam Blouse" 
            class="admin-form-control" 
            required
            style="width: 100%; height: 46px; font-size: 15px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 8px; font-family: inherit;"
          >
          <span style="font-size: 12px; color: rgba(17,29,66,0.5); margin-top: 4px; display: block;">
            The title displayed to customers on the website (e.g. Blouse design name or code).
          </span>
        </div>

        <!-- Field 2: Category & Price Grid -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div>
            <label style="display: block; font-size: 13.5px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">
              2. Select Category <span style="color: #dc2626;">*</span>
            </label>
            <select 
              id="quickCategory" 
              name="category" 
              class="admin-form-control" 
              required
              style="width: 100%; height: 46px; font-size: 14px; padding: 0 12px; border: 1.5px solid var(--border); border-radius: 8px; font-family: inherit; background: #fff;"
            >
              ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
              <option value="Custom">+ Custom Category...</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 13.5px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">
              3. Price (₹)
            </label>
            <input 
              type="number" 
              id="quickPrice" 
              name="price" 
              value="45" 
              min="0"
              class="admin-form-control" 
              style="width: 100%; height: 46px; font-size: 15px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 8px; font-family: inherit;"
            >
          </div>
        </div>

        <!-- Custom Category input (hidden by default) -->
        <div id="quickCustomCategoryRow" style="display: none; margin-bottom: 20px;">
          <label style="display: block; font-size: 12.5px; font-weight: 600; color: var(--navy); margin-bottom: 4px;">Enter New Category Name</label>
          <input type="text" id="quickCustomCategory" placeholder="e.g. Festive Anarkali" class="admin-form-control" style="width: 100%; height: 40px; font-size: 14px;">
        </div>

        <!-- Field 4: Design Image Upload Card -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <label style="font-size: 13.5px; font-weight: 700; color: var(--navy);">
              4. Design Image (Photo / Preview) <span style="color: #dc2626;">*</span>
            </label>
            <span style="font-size: 11.5px; color: var(--gold); font-weight: 600;">PNG, JPG, WEBP</span>
          </div>

          <div id="quickImageDropzone" style="border: 2px dashed ${quickSelectedImage ? 'var(--gold)' : 'var(--border)'}; border-radius: 12px; padding: 24px; text-align: center; background: #faf8f5; cursor: pointer; position: relative; transition: all 0.2s ease;">
            <input type="file" id="quickImageInput" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2;">
            
            <div id="quickImagePlaceholder" style="${quickSelectedImage ? 'display: none;' : 'display: flex; flex-direction: column; align-items: center; gap: 8px;'}">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                ${icon("image", 24)}
              </div>
              <strong style="font-size: 14px; color: var(--navy);">Click or Drag & Drop Design Image</strong>
              <span style="font-size: 12px; color: rgba(17,29,66,0.5);">Front Neck or main cover photo (stored on Sanity Global CDN)</span>
            </div>

            <div id="quickImagePreview" style="${quickSelectedImage ? 'display: flex; flex-direction: column; align-items: center; gap: 10px;' : 'display: none;'}">
              <img id="quickImagePreviewImg" src="${attr(quickSelectedImage?.previewUrl || '')}" style="max-height: 180px; max-width: 100%; object-fit: contain; border-radius: 8px; background: #fff; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span id="quickImageNameBadge" style="font-size: 12px; font-weight: 600; color: var(--navy);">${escapeHtml(quickSelectedImage?.filename || '')}</span>
                <button type="button" id="quickRemoveImageBtn" style="background: #fee2e2; color: #dc2626; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 700; cursor: pointer;">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Field 5: Embroidery Machine File Card -->
        <div style="margin-bottom: 28px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <label style="font-size: 13.5px; font-weight: 700; color: var(--navy);">
              5. Embroidery Machine File (.DST, .PES, .JEF, .ZIP) <span style="font-size: 12px; color: rgba(17,29,66,0.5); font-weight: normal;">(Optional but recommended)</span>
            </label>
            <span style="font-size: 11.5px; color: var(--gold); font-weight: 600;">Production Machine Format</span>
          </div>

          <div id="quickFileDropzone" style="border: 2px dashed ${quickSelectedMachineFile ? '#16a34a' : 'var(--border)'}; border-radius: 12px; padding: 22px; text-align: center; background: #faf8f5; cursor: pointer; position: relative; transition: all 0.2s ease;">
            <input type="file" id="quickMachineFileInput" accept=".dst,.pes,.jef,.exp,.xxx,.zip" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2;">
            
            <div id="quickFilePlaceholder" style="${quickSelectedMachineFile ? 'display: none;' : 'display: flex; flex-direction: column; align-items: center; gap: 6px;'}">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                ${icon("file-archive", 22)}
              </div>
              <strong style="font-size: 13.5px; color: var(--navy);">Click or Drag & Drop Embroidery File</strong>
              <span style="font-size: 12px; color: rgba(17,29,66,0.5);">Supports Tajima (.DST), Brother (.PES), Janome (.JEF), or ZIP package</span>
            </div>

            <div id="quickFilePreview" style="${quickSelectedMachineFile ? 'display: flex; align-items: center; justify-content: center; gap: 12px;' : 'display: none;'}">
              <span id="quickFileExtBadge" style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; background: #111D42; color: #fff;">
                ${escapeHtml((quickSelectedMachineFile?.filename?.split('.').pop() || 'DST').toUpperCase())}
              </span>
              <span id="quickFileNameText" style="font-size: 13px; font-weight: 600; color: var(--navy);">
                ${escapeHtml(quickSelectedMachineFile?.filename || '')}
              </span>
              <span id="quickFileSizeText" style="font-size: 12px; color: rgba(17,29,66,0.5);">
                (${quickSelectedMachineFile ? (quickSelectedMachineFile.size / 1024).toFixed(1) + ' KB' : ''})
              </span>
              <button type="button" id="quickRemoveFileBtn" style="background: #fee2e2; color: #dc2626; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 700; cursor: pointer; margin-left: 8px;">Remove</button>
            </div>
          </div>
        </div>

        <!-- Progress status indicator -->
        <div id="quickProgressContainer" style="display: ${quickIsSubmitting ? 'block' : 'none'}; margin-bottom: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; text-align: center;">
          <div style="font-size: 13px; font-weight: 600; color: #1e40af;" id="quickProgressText">
            ${escapeHtml(quickUploadProgress || "Uploading design...")}
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button 
            type="submit" 
            id="quickSubmitBtn" 
            class="button button-primary" 
            ${quickIsSubmitting ? 'disabled' : ''}
            style="width: 100%; height: 50px; font-size: 15px; font-weight: 700; background: var(--navy); color: #fff; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 14px rgba(17,29,66,0.2);"
          >
            ${quickIsSubmitting ? icon("loader", 18) : icon("upload-cloud", 18)}
            <span>${quickIsSubmitting ? "Publishing Design..." : "Publish Design to Website"}</span>
          </button>
        </div>

      </form>

      <!-- Live Storefront Preview Section -->
      <div style="margin-top: 36px; border-top: 1px solid var(--border); padding-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); margin: 0;">
            Recent Designs in Catalog
          </h2>
          <a href="#/catalog" style="font-size: 13px; color: var(--gold); font-weight: 600; text-decoration: none;">
            View Full Storefront Catalog &rarr;
          </a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
          ${(site.products || []).slice(0, 4).map(p => `
            <div style="background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <div style="aspect-ratio: 1/1; background: #faf8f5; position: relative;">
                <img src="${attr(p.image)}" alt="${attr(p.title)}" style="width: 100%; height: 100%; object-fit: contain;">
                <span style="position: absolute; top: 8px; left: 8px; background: rgba(17,29,66,0.85); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">${escapeHtml(p.code || '')}</span>
              </div>
              <div style="padding: 12px;">
                <strong style="font-size: 13px; color: var(--navy); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.title)}</strong>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                  <span style="font-size: 14px; font-weight: 700; color: var(--gold);">${money(p.price || 45)}</span>
                  <a href="#/product/${attr(p.slug)}" style="font-size: 12px; color: var(--navy); font-weight: 600; text-decoration: underline;">Details</a>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// Convert File to Base64 helper
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function initQuickUploadEvents() {
  const form = document.getElementById("quickUploadForm");
  if (!form) return;

  const imageInput = document.getElementById("quickImageInput");
  const machineFileInput = document.getElementById("quickMachineFileInput");
  const categorySelect = document.getElementById("quickCategory");
  const customCatRow = document.getElementById("quickCustomCategoryRow");
  const customCatInput = document.getElementById("quickCustomCategory");

  // Category select change
  if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
      if (e.target.value === "Custom") {
        if (customCatRow) customCatRow.style.display = "block";
        if (customCatInput) customCatInput.focus();
      } else {
        if (customCatRow) customCatRow.style.display = "none";
      }
    });
  }

  // Image input change
  if (imageInput) {
    imageInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const previewUrl = event.target.result;
          const base64 = previewUrl.split(",")[1];
          quickSelectedImage = {
            file,
            base64,
            previewUrl,
            filename: file.name,
            contentType: file.type || "image/png"
          };

          const ph = document.getElementById("quickImagePlaceholder");
          const prev = document.getElementById("quickImagePreview");
          const img = document.getElementById("quickImagePreviewImg");
          const badge = document.getElementById("quickImageNameBadge");
          const dropzone = document.getElementById("quickImageDropzone");

          if (ph) ph.style.display = "none";
          if (prev) prev.style.display = "flex";
          if (img) img.src = previewUrl;
          if (badge) badge.innerText = file.name;
          if (dropzone) dropzone.style.borderColor = "var(--gold)";
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Remove Image button
  document.addEventListener("click", (e) => {
    if (e.target.id === "quickRemoveImageBtn") {
      quickSelectedImage = null;
      const ph = document.getElementById("quickImagePlaceholder");
      const prev = document.getElementById("quickImagePreview");
      const img = document.getElementById("quickImagePreviewImg");
      const dropzone = document.getElementById("quickImageDropzone");
      const input = document.getElementById("quickImageInput");
      if (ph) ph.style.display = "flex";
      if (prev) prev.style.display = "none";
      if (img) img.src = "";
      if (dropzone) dropzone.style.borderColor = "var(--border)";
      if (input) input.value = "";
    }
  });

  // Machine file input change
  if (machineFileInput) {
    machineFileInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const base64 = await fileToBase64(file);
        quickSelectedMachineFile = {
          file,
          base64,
          filename: file.name,
          contentType: "application/octet-stream",
          size: file.size
        };

        const ph = document.getElementById("quickFilePlaceholder");
        const prev = document.getElementById("quickFilePreview");
        const badge = document.getElementById("quickFileExtBadge");
        const nameText = document.getElementById("quickFileNameText");
        const sizeText = document.getElementById("quickFileSizeText");
        const dropzone = document.getElementById("quickFileDropzone");

        if (ph) ph.style.display = "none";
        if (prev) prev.style.display = "flex";
        const ext = (file.name.split(".").pop() || "DST").toUpperCase();
        if (badge) badge.innerText = ext;
        if (nameText) nameText.innerText = file.name;
        if (sizeText) sizeText.innerText = "(" + (file.size / 1024).toFixed(1) + " KB)";
        if (dropzone) dropzone.style.borderColor = "#16a34a";
      }
    });
  }

  // Remove Machine file button
  document.addEventListener("click", (e) => {
    if (e.target.id === "quickRemoveFileBtn") {
      quickSelectedMachineFile = null;
      const ph = document.getElementById("quickFilePlaceholder");
      const prev = document.getElementById("quickFilePreview");
      const dropzone = document.getElementById("quickFileDropzone");
      const input = document.getElementById("quickMachineFileInput");
      if (ph) ph.style.display = "flex";
      if (prev) prev.style.display = "none";
      if (dropzone) dropzone.style.borderColor = "var(--border)";
      if (input) input.value = "";
    }
  });

  // Upload Another button
  document.addEventListener("click", (e) => {
    if (e.target.id === "quickUploadAnotherBtn") {
      quickPublishedProduct = null;
      quickSelectedImage = null;
      quickSelectedMachineFile = null;
      triggerRender();
    }
  });

  // Form Submit Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (quickIsSubmitting) return;

    const titleInput = document.getElementById("quickTitle");
    const priceInput = document.getElementById("quickPrice");
    const title = titleInput ? titleInput.value.trim() : "";
    let category = categorySelect ? categorySelect.value : "Blouse Designs";
    if (category === "Custom" && customCatInput) {
      category = customCatInput.value.trim() || "Blouse Designs";
    }
    const price = priceInput ? Number(priceInput.value) || 45 : 45;

    if (!title) {
      showToast("Please enter a Design Title.");
      if (titleInput) titleInput.focus();
      return;
    }

    if (!quickSelectedImage || !quickSelectedImage.base64) {
      showToast("Please select a Design Image to upload.");
      return;
    }

    const submitBtn = document.getElementById("quickSubmitBtn");
    const progressContainer = document.getElementById("quickProgressContainer");
    const progressText = document.getElementById("quickProgressText");

    quickIsSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector("span").innerText = "Publishing to Sanity...";
    }
    if (progressContainer) progressContainer.style.display = "block";
    if (progressText) progressText.innerText = "Connecting to Sanity Cloud CDN...";

    try {
      if (progressText) progressText.innerText = "Uploading image & files to Sanity Content Lake...";

      const payload = {
        title,
        category,
        price,
        image: {
          filename: quickSelectedImage.filename,
          contentType: quickSelectedImage.contentType,
          base64: quickSelectedImage.base64
        },
        machineFile: quickSelectedMachineFile ? {
          filename: quickSelectedMachineFile.filename,
          contentType: quickSelectedMachineFile.contentType,
          base64: quickSelectedMachineFile.base64,
          size: quickSelectedMachineFile.size
        } : null
      };

      const res = await fetch("/api/admin/sanity-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || ("Upload failed with HTTP " + res.status));
      }

      const data = await res.json();
      console.log("Quick Uploader: Published successfully:", data);

      if (progressText) progressText.innerText = "✓ Published! Updating storefront catalog...";

      // Refetch latest products from backend so storefront has it immediately
      try {
        const liveProds = await productService.getProducts();
        if (Array.isArray(liveProds) && liveProds.length > 0) {
          site.products = liveProds;
          DB.saveProducts(site.products);
          recordLocalWrite();
        }
      } catch (syncErr) {
        console.warn("Notice: Product list sync warning:", syncErr);
      }

      showToast("Design published successfully to Sanity Cloud!");

      quickPublishedProduct = data.product;
      quickSelectedImage = null;
      quickSelectedMachineFile = null;
      quickIsSubmitting = false;

      // Re-render the quick upload view with success card
      triggerRender();

    } catch (err) {
      console.error("Quick Uploader error:", err);
      showToast("Failed to publish: " + err.message);
      if (progressContainer) progressContainer.style.display = "none";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector("span").innerText = "Publish Design to Website";
      }
      quickIsSubmitting = false;
    }
  });
}
