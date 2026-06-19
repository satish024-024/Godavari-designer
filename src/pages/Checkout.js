import { site, cart, currentUser, showToast, triggerRender } from "../services/store.js";
import { orderService } from "../services/supabase.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

// Local Page State
let lastPage = "";
let submissionResult = null; // null | { referenceNumber, name, email, phone, address, total, orderType, createdAt }
let checkoutOrderType = "design"; // 'design' | 'custom'

function generateOrderReferenceNumber() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randStr = '';
  for (let i = 0; i < 8; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GD-ORD-${year}-${randStr}`;
}

function getProduct(id) {
  return site.products.find((product) => product.id === id);
}

export function renderCheckout() {
  // Reset local state when entering checkout page afresh
  const path = window.location.hash || "#/";
  if (lastPage !== "checkout") {
    lastPage = "checkout";
    submissionResult = null;
    checkoutOrderType = "design";
  }

  // Success dashboard screen
  if (submissionResult) {
    const whatsappMsg = `Hello Godavari Designer, I've just placed an order.
Order Reference: ${submissionResult.referenceNumber}
Order Type: ${submissionResult.orderType === "custom" ? "Custom Digitizing" : "Embroidery Design"}
Total Amount: ${money(submissionResult.total)}
Customer Name: ${submissionResult.name}
Phone: ${submissionResult.phone}
Please confirm my order.`;

    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMsg)}`;

    return `
      <section class="content-section success-section" style="padding: 120px 24px; background: var(--ivory); min-height: 80vh;">
        <div class="success-card" style="max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid var(--border); padding: 40px; border-radius: 8px; text-align: center; display: grid; gap: 20px; justify-items: center; box-shadow: var(--shadow-deep);">
          <div class="success-check-icon" style="width: 72px; height: 72px; border-radius: 50%; background: #25d366; color: #fff; display: flex; align-items: center; justify-content: center;">
            ${icon("check", 32)}
          </div>
          
          <h1 style="font-family: var(--font-serif); font-size: 32px; color: var(--navy); margin: 0; font-weight: 700;">Order Placed Successfully</h1>
          <p style="color: var(--ink-soft); font-size: 14px; max-width: 500px; margin: 0;">
            Thank you for shopping with Godavari Designer! To complete your payment verification, please click below to send confirmation via WhatsApp.
          </p>

          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 24px; width: 100%; text-align: left; display: grid; gap: 10px; margin-top: 10px;">
            <div style="display:flex; justify-content:space-between; font-size:14px;">
              <span style="color:var(--ink-soft);">Order Reference:</span>
              <strong style="color:var(--navy); font-family:monospace; font-size:15px;">${escapeHtml(submissionResult.referenceNumber)}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px;">
              <span style="color:var(--ink-soft);">Order Type:</span>
              <strong style="color:var(--navy);">${submissionResult.orderType === "custom" ? "Custom Digitizing Order" : "Embroidery Design Order"}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px;">
              <span style="color:var(--ink-soft);">Customer Name:</span>
              <strong style="color:var(--navy);">${escapeHtml(submissionResult.name)}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px;">
              <span style="color:var(--ink-soft);">Total Amount:</span>
              <strong style="color:var(--navy); font-size:16px;">${money(submissionResult.total)}</strong>
            </div>
          </div>

          <!-- Process Flow Tracker -->
          <div style="width: 100%; margin-top: 10px;">
            <div style="font-weight:700; font-size:12px; color:var(--navy); text-transform:uppercase; margin-bottom:16px; text-align: left;">Order Tracking Progress</div>
            <div class="tracking-timeline" style="display: flex; justify-content: space-between; position: relative;">
              <div class="tracking-step active">
                <div class="tracking-dot">1</div>
                <span class="tracking-label" style="font-size: 10px;">Submitted</span>
              </div>
              <div class="tracking-step">
                <div class="tracking-dot">2</div>
                <span class="tracking-label" style="font-size: 10px;">Paid</span>
              </div>
              <div class="tracking-step">
                <div class="tracking-dot">3</div>
                <span class="tracking-label" style="font-size: 10px;">Processing</span>
              </div>
              <div class="tracking-step">
                <div class="tracking-dot">4</div>
                <span class="tracking-label" style="font-size: 10px;">Completed</span>
              </div>
            </div>
          </div>

          <!-- Checkout actions -->
          <div style="display: grid; gap: 12px; width: 100%; margin-top: 20px;">
            <!-- Primary WhatsApp CTA -->
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button" style="background: #25d366; color: #fff; text-decoration: none; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; font-weight: 700; border-radius: 4px; font-size: 15px; box-shadow: var(--shadow-deep);">
              ${icon("phone", 18)} Confirm Order via WhatsApp
            </a>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
              <!-- Placeholder: Download Invoice -->
              <button type="button" onclick="alert('Invoice PDF generation is upcoming.')" class="button button-secondary" style="min-height: 44px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; font-weight: 600;">
                ${icon("file-text", 16)} Download Invoice
              </button>
              
              <!-- Placeholder: Track Order -->
              <a href="#/track-order?ref=${submissionResult.referenceNumber}" class="button button-secondary" style="text-decoration: none; min-height: 44px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; font-weight: 600;">
                ${icon("compass", 16)} Track Order Status
              </a>
            </div>

            <a href="#/catalog" class="button button-primary" style="margin-top: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px;">
              <span>Continue Shopping</span>
              ${icon("arrow-right", 18)}
            </a>
          </div>

        </div>
      </section>
    `;
  }

  // Redirect if cart is empty
  if (!cart || cart.length === 0) {
    return `
      <section class="content-section checkout-empty-section" style="padding: 120px 24px; text-align: center; background: var(--ivory); min-height: 70vh; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 440px; margin: 0 auto; display: grid; gap: 16px; justify-items: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--navy); margin-bottom: 8px;">
            ${icon("shopping-bag", 30)}
          </div>
          <h1 style="font-family: var(--font-serif); font-size: 32px; color: var(--navy); font-weight: 700; margin: 0;">Checkout Is Empty</h1>
          <p style="color: var(--ink-soft); font-size: 14px; line-height: 1.6; margin: 0;">
            Please select embroidery designs from the catalog and add them to your cart before checking out.
          </p>
          <a href="#/catalog" class="button button-primary" style="margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            <span>Browse Catalog</span>
            ${icon("arrow-right", 18)}
          </a>
        </div>
      </section>
    `;
  }

  // Compute pricing
  let subtotal = 0;
  const summaryLinesHtml = cart.map((item) => {
    const product = getProduct(item.id);
    if (!product) return "";
    const formatObj = product.formats ? product.formats.find(f => f.format === item.format) : null;
    const price = formatObj ? formatObj.price : product.price;
    const itemTotal = price * item.qty;
    subtotal += itemTotal;

    return `
      <div style="display: flex; gap: 12px; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
        <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" style="width: 48px; height: 48px; border-radius: 4px; object-fit: cover; border: 1px solid var(--border);" />
        <div style="flex: 1; min-width: 0;">
          <h4 style="font-size: 13px; color: var(--navy); font-weight: 700; margin: 0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(product.title)}</h4>
          <span style="font-size: 11px; color: var(--ink-soft); display: block; margin-top: 2px;">Format: ${escapeHtml(item.format)} &bull; Qty: ${item.qty}</span>
        </div>
        <strong style="font-size: 14px; color: var(--navy); font-family: var(--font-serif);">${money(itemTotal)}</strong>
      </div>
    `;
  }).join("");

  const processingFee = 0;
  const grandTotal = subtotal + processingFee;

  const defaultName = currentUser ? currentUser.name : "";
  const defaultEmail = currentUser ? currentUser.email : "";

  return `
    <section class="content-section checkout-page-section" style="padding-top: var(--header-height); background: var(--ivory); min-height: 90vh;">
      <div style="width: min(100%, 1280px); margin: 0 auto; padding: 32px 24px 80px;">
        
        <div style="margin-bottom: 32px;">
          <h1 style="font-family: var(--font-serif); font-size: clamp(36px, 4.5vw, 54px); color: var(--navy); font-weight: 700; margin: 0 0 8px;">Checkout</h1>
          <p style="color: var(--ink-soft); font-size: 15px; margin: 0;">Provide your customer details to submit your embroidery order.</p>
        </div>

        <div class="checkout-layout" style="display: grid; grid-template-columns: 1fr 400px; gap: 32px;">
          <!-- Left: Information Form -->
          <form id="checkoutSubmitForm" style="display: grid; gap: 20px; align-content: start;">
            
            <!-- Step 1: Order Type -->
            <div style="border: 1px solid var(--border); padding: 24px; border-radius: 6px; background: #fff; display: grid; gap: 16px;">
              <h2 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--gold);">${icon("layers", 18)}</span>
                <span>Select Order Type</span>
              </h2>
              
              <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                <span>Order Classification *</span>
                <select id="checkoutOrderTypeSelect" name="orderType" required style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px; background: #fff; font-weight: 600;">
                  <option value="design" ${checkoutOrderType === "design" ? "selected" : ""}>Embroidery Design Order (Digital Download)</option>
                  <option value="custom" ${checkoutOrderType === "custom" ? "selected" : ""}>Custom Embroidery Digitizing (Production)</option>
                </select>
              </label>
            </div>

            <!-- Step 2: Customer Contact Info -->
            <div style="border: 1px solid var(--border); padding: 24px; border-radius: 6px; background: #fff; display: grid; gap: 16px;">
              <h2 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--gold);">${icon("user", 18)}</span>
                <span>Customer Information</span>
              </h2>

              <div style="display: grid; gap: 16px;">
                <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                  <span>Full Name *</span>
                  <input type="text" name="customerName" required value="${attr(defaultName)}" placeholder="e.g. Sameer Kumar" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                </label>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                    <span>Email Address *</span>
                    <input type="email" name="customerEmail" required value="${attr(defaultEmail)}" placeholder="name@designer.com" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                  </label>

                  <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                    <span>Phone Number (Mandatory) *</span>
                    <input type="tel" name="customerPhone" required placeholder="+91 98765 43210" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                  </label>
                </div>
              </div>
            </div>

            <!-- Step 3: Shipping (Conditional on Custom Order Selection) -->
            <div id="checkoutShippingContainer" style="border: 1px solid var(--border); padding: 24px; border-radius: 6px; background: #fff; display: ${checkoutOrderType === "custom" ? "grid" : "none"}; gap: 16px;">
              <h2 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--gold);">${icon("truck", 18)}</span>
                <span>Delivery Information</span>
              </h2>
              <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                <span>Shipping Address *</span>
                <textarea name="shippingAddress" ${checkoutOrderType === "custom" ? "required" : ""} placeholder="Enter physical shipping address details for custom sample garments or bulk roll shipments..." style="width: 100%; height: 90px; padding: 10px; border: 1px solid var(--border); border-radius: 4px; resize: none;"></textarea>
              </label>
            </div>

            <button type="submit" class="button button-primary" style="min-height: 52px; font-size: 15px; font-weight: 700; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: var(--shadow-deep);">
              <span>Submit & Place Order</span>
              ${icon("arrow-right", 18)}
            </button>

          </form>

          <!-- Right: Summary Card -->
          <div style="display: grid; gap: 20px; align-content: start;">
            <div style="border: 1px solid var(--border); padding: 24px; border-radius: 6px; background: #fff; display: grid; gap: 20px;">
              <h2 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); font-weight: 700; margin: 0; padding-bottom: 12px; border-bottom: 1px solid var(--border);">Items In Order</h2>
              
              <div style="display: grid; gap: 16px; max-height: 320px; overflow-y: auto; padding-right: 4px;">
                ${summaryLinesHtml}
              </div>

              <div style="display: grid; gap: 12px; font-size: 13px; margin-top: 10px; border-top: 1px solid var(--border); padding-top: 16px;">
                <div style="display: flex; justify-content: space-between; color: var(--ink-soft);">
                  <span>Design Subtotal</span>
                  <strong>${money(subtotal)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--ink-soft);">
                  <span>Processing Fee</span>
                  <strong>${processingFee === 0 ? "Free" : money(processingFee)}</strong>
                </div>
                <hr style="border: 0; border-top: 1px solid var(--border); margin: 4px 0;" />
                <div style="display: flex; justify-content: space-between; font-size: 16px; color: var(--navy); font-weight: 700;">
                  <span>Grand Total</span>
                  <strong>${money(grandTotal)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  `;
}

// Bind events & form processing
let eventsBound = false;
export function initCheckoutEvents() {
  if (eventsBound) return;
  eventsBound = true;

  // Listen to select change
  document.addEventListener("change", (e) => {
    if (e.target.id === "checkoutOrderTypeSelect") {
      checkoutOrderType = e.target.value;
      
      // Update conditional shipping visibility
      const container = document.getElementById("checkoutShippingContainer");
      if (container) {
        container.style.display = checkoutOrderType === "custom" ? "grid" : "none";
        
        // Toggle required attribute
        const textarea = container.querySelector("textarea");
        if (textarea) {
          if (checkoutOrderType === "custom") {
            textarea.setAttribute("required", "");
          } else {
            textarea.removeAttribute("required");
          }
        }
      }
    }
  });

  // Handle form submission
  document.addEventListener("submit", async (e) => {
    if (e.target.id === "checkoutSubmitForm") {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      const submitBtn = e.target.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `Placing Order...`;
      }

      try {
        const orderRef = generateOrderReferenceNumber();

        // 1. Calculate pricing from cart items
        let subtotal = 0;
        const dbItems = cart.map(item => {
          const product = getProduct(item.id);
          const formatObj = product.formats ? product.formats.find(f => f.format === item.format) : null;
          const price = formatObj ? formatObj.price : product.price;
          subtotal += price * item.qty;

          return {
            productId: item.id,
            price: price,
            format: item.format,
            qty: item.qty
          };
        });

        const notesPayload = {
          client_phone: formData.get("customerPhone"),
          client_email: formData.get("customerEmail"),
          shipping_address: formData.get("shippingAddress") || null,
          created_at: new Date().toISOString()
        };

        const orderData = {
          userId: currentUser ? currentUser.id : null,
          total: subtotal,
          paymentStatus: "pending",
          status: "pending",
          referenceNumber: orderRef,
          customerName: formData.get("customerName"),
          customerEmail: formData.get("customerEmail"),
          customerPhone: formData.get("customerPhone"),
          shippingAddress: formData.get("shippingAddress") || null,
          orderType: checkoutOrderType,
          notes: JSON.stringify(notesPayload)
        };

        // Save order to Supabase
        const resultOrder = await orderService.createOrder(orderData, dbItems);

        // Store result for success screen rendering
        submissionResult = {
          referenceNumber: orderRef,
          name: orderData.customerName,
          email: orderData.customerEmail,
          phone: orderData.customerPhone,
          address: orderData.shippingAddress,
          total: subtotal,
          orderType: checkoutOrderType,
          createdAt: new Date().toISOString()
        };

        // Clear local cart completely
        cart.length = 0;
        localStorage.setItem("godavari-designer-cart-v1", JSON.stringify([]));

        showToast("Order placed successfully!");
        triggerRender();
      } catch (err) {
        console.error("Order submission failure:", err);
        showToast(`Order failed: ${err.message}`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `Submit & Place Order ${icon("arrow-right", 18)}`;
        }
      }
    }
  });
}
