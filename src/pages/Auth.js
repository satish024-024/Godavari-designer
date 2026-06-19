import { ui, login, register, triggerRender, showToast } from "../services/store.js";
import { authService, supabase, initSupabase } from "../services/supabase.js";
import { escapeHtml, icon } from "../utils/helpers.js";

// Local Page State
let authMode = "signin"; // 'signin' | 'signup' | 'forgot' | 'reset-confirm'
let authError = "";
let isSubmitting = false;
let resetConfirmModeLoaded = false;

export function renderAuth() {
  // Sync password reset mode from URL query parameters
  const params = ui.pageParams || {};
  if (params.mode === "reset-confirm" && !resetConfirmModeLoaded) {
    authMode = "reset-confirm";
    resetConfirmModeLoaded = true;
  }

  let titleText = "Sign In";
  let subtitleText = "Access your luxury design library and digitizing tracker.";
  let formContentHtml = "";

  // CSS Styles specific to the Auth module
  const stylesHtml = `
    <style>
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .auth-container {
        width: 100%;
        animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .auth-card {
        background: #ffffff;
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: var(--shadow-deep);
        padding: clamp(24px, 5vw, 48px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        width: 100%;
      }

      .auth-card:hover {
        box-shadow: 0 42px 120px rgba(17, 29, 66, 0.18);
        border-color: rgba(200, 161, 90, 0.4);
      }

      .auth-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .auth-input-icon {
        position: absolute;
        left: 14px;
        color: var(--gold);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .auth-input {
        width: 100%;
        padding: 12px 14px 12px 42px;
        border: 1.5px solid var(--border);
        border-radius: 6px;
        font-size: 14px;
        color: var(--navy);
        background: #fafaf9;
        font-family: var(--font-sans);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        outline: none;
      }

      .auth-input:focus {
        border-color: var(--gold);
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(200, 161, 90, 0.12);
      }

      .auth-input::placeholder {
        color: rgba(17, 29, 66, 0.4);
      }

      .auth-label {
        display: grid;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        color: var(--navy);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .auth-submit-btn {
        width: 100%;
        min-height: 48px;
        background: var(--navy);
        color: #ffffff;
        border: 1px solid var(--navy);
        border-radius: 6px;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .auth-submit-btn:hover:not(:disabled) {
        background: #192a5c;
        border-color: #192a5c;
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(17, 29, 66, 0.18);
      }

      .auth-submit-btn:disabled {
        background: var(--border);
        border-color: var(--border);
        color: var(--ink-soft);
        cursor: not-allowed;
      }

      .google-auth-btn {
        width: 100%;
        min-height: 48px;
        background: #ffffff;
        color: #3c4043;
        border: 1px solid #dadce0;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-family: var(--font-sans);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .google-auth-btn:hover {
        background: #fafaf9;
        border-color: #bee0ff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      .auth-link {
        border: none;
        background: none;
        text-decoration: underline;
        color: var(--gold);
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        padding: 0;
        transition: color 0.2s ease;
      }

      .auth-link:hover {
        color: var(--navy);
      }

      .auth-footer-text {
        text-align: center;
        font-size: 13px;
        color: var(--ink-soft);
        margin-top: 20px;
      }

      .auth-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 20px 0;
      }

      .auth-divider-line {
        flex: 1;
        height: 1px;
        background: var(--border);
      }

      .auth-divider-text {
        font-size: 10px;
        color: var(--ink-soft);
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.1em;
      }

      .form-grid-2 {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }

      @media(min-width: 768px) {
        .form-grid-2 {
          grid-template-columns: 1fr 1fr;
        }
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #ffffff;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;

  if (authMode === "signin") {
    titleText = "Sign In";
    subtitleText = "Access your customer account or administrator portal.";
    formContentHtml = `
      <form id="customerLoginForm" style="display: grid; gap: 20px;">
        <label class="auth-label">
          <span>Email Address</span>
          <div class="auth-input-wrapper">
            <span class="auth-input-icon">${icon("mail", 17)}</span>
            <input type="email" name="email" required placeholder="name@domain.com" class="auth-input" />
          </div>
        </label>
        
        <label class="auth-label">
          <span style="display: flex; justify-content: space-between;">
            <span>Password</span>
            <button type="button" id="toForgotTabBtn" class="auth-link">Forgot?</button>
          </span>
          <div class="auth-input-wrapper">
            <span class="auth-input-icon">${icon("lock", 17)}</span>
            <input type="password" name="password" required placeholder="••••••••" class="auth-input" />
          </div>
        </label>
        
        <button type="submit" class="auth-submit-btn" ${isSubmitting ? "disabled" : ""}>
          ${isSubmitting ? `<div class="spinner"></div> Signing In...` : "Sign In"}
        </button>

        <div class="auth-divider">
          <div class="auth-divider-line"></div>
          <span class="auth-divider-text">or</span>
          <div class="auth-divider-line"></div>
        </div>

        <button type="button" class="google-auth-btn google-login-trigger-btn">
          <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div class="auth-footer-text">
          Don't have an account? 
          <button type="button" id="toSignUpTabBtn" class="auth-link" style="margin-left: 4px;">Create Account</button>
        </div>
      </form>
    `;
  } else if (authMode === "signup") {
    titleText = "Create Account";
    subtitleText = "Sign up to track purchases, save designs, and request custom digitizing.";
    formContentHtml = `
      <form id="customerRegisterForm" style="display: grid; gap: 24px;">
        <div class="form-grid-2">
          <!-- Column 1: Account Credentials -->
          <div style="display: grid; gap: 16px;">
            <div style="font-family: var(--font-serif); font-size: 18px; color: var(--navy); border-bottom: 1.5px solid var(--border); padding-bottom: 6px; margin-bottom: 4px; font-weight: 600;">
              Account Credentials
            </div>
            
            <label class="auth-label">
              <span>Full Name *</span>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">${icon("user", 17)}</span>
                <input type="text" name="name" required placeholder="Your name" class="auth-input" />
              </div>
            </label>
            
            <label class="auth-label">
              <span>Phone Number</span>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">${icon("phone", 17)}</span>
                <input type="text" name="phone" placeholder="98765 43210" class="auth-input" />
              </div>
            </label>

            <label class="auth-label">
              <span>Email Address *</span>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">${icon("mail", 17)}</span>
                <input type="email" name="email" required placeholder="name@domain.com" class="auth-input" />
              </div>
            </label>

            <label class="auth-label">
              <span>Password *</span>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">${icon("lock", 17)}</span>
                <input type="password" name="password" required placeholder="Min 6 characters" class="auth-input" />
              </div>
            </label>
          </div>

          <!-- Column 2: Default Delivery Address -->
          <div style="display: grid; gap: 16px;">
            <div style="font-family: var(--font-serif); font-size: 18px; color: var(--navy); border-bottom: 1.5px solid var(--border); padding-bottom: 6px; margin-bottom: 4px; font-weight: 600;">
              Default Delivery Address
            </div>

            <label class="auth-label">
              <span>Address Line 1</span>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">${icon("map-pin", 17)}</span>
                <input type="text" name="addressLine1" placeholder="House/Flat/Office details" class="auth-input" />
              </div>
            </label>

            <label class="auth-label">
              <span>Address Line 2</span>
              <div class="auth-input-wrapper">
                <span class="auth-input-icon">${icon("map-pin", 17)}</span>
                <input type="text" name="addressLine2" placeholder="Street, Area, Landmark" class="auth-input" />
              </div>
            </label>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <label class="auth-label">
                <span>City</span>
                <input type="text" name="city" placeholder="City" class="auth-input" style="padding-left: 14px;" />
              </label>
              <label class="auth-label">
                <span>State / Region</span>
                <input type="text" name="state" placeholder="State" class="auth-input" style="padding-left: 14px;" />
              </label>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <label class="auth-label">
                <span>Country</span>
                <input type="text" name="country" placeholder="Country" class="auth-input" style="padding-left: 14px;" />
              </label>
              <label class="auth-label">
                <span>Postal / Zip Code</span>
                <input type="text" name="postalCode" placeholder="Postal Code" class="auth-input" style="padding-left: 14px;" />
              </label>
            </div>
          </div>
        </div>
        
        <div style="display: grid; gap: 12px; margin-top: 10px;">
          <button type="submit" class="auth-submit-btn" ${isSubmitting ? "disabled" : ""}>
            ${isSubmitting ? `<div class="spinner"></div> Creating Account...` : "Create Account"}
          </button>

          <div class="auth-divider">
            <div class="auth-divider-line"></div>
            <span class="auth-divider-text">or</span>
            <div class="auth-divider-line"></div>
          </div>

          <button type="button" class="google-auth-btn google-login-trigger-btn">
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div class="auth-footer-text">
          Already have an account? 
          <button type="button" id="toSignInTabBtn" class="auth-link" style="margin-left: 4px;">Sign In</button>
        </div>
      </form>
    `;
  } else if (authMode === "forgot") {
    titleText = "Reset Password";
    subtitleText = "Enter your email address to receive password recovery instructions.";
    formContentHtml = `
      <form id="forgotPasswordForm" style="display: grid; gap: 20px;">
        <label class="auth-label">
          <span>Email Address</span>
          <div class="auth-input-wrapper">
            <span class="auth-input-icon">${icon("mail", 17)}</span>
            <input type="email" name="email" required placeholder="name@domain.com" class="auth-input" />
          </div>
        </label>
        
        <button type="submit" class="auth-submit-btn" ${isSubmitting ? "disabled" : ""}>
          ${isSubmitting ? `<div class="spinner"></div> Sending...` : "Send Reset Email"}
        </button>

        <div class="auth-footer-text">
          Back to 
          <button type="button" id="toSignInTabBtn" class="auth-link" style="margin-left: 4px;">Sign In</button>
        </div>
      </form>
    `;
  } else if (authMode === "reset-confirm") {
    titleText = "Set New Password";
    subtitleText = "Enter your new account password below.";
    formContentHtml = `
      <form id="resetPasswordConfirmForm" style="display: grid; gap: 20px;">
        <label class="auth-label">
          <span>New Password</span>
          <div class="auth-input-wrapper">
            <span class="auth-input-icon">${icon("lock", 17)}</span>
            <input type="password" name="password" required placeholder="Min 6 characters" class="auth-input" />
          </div>
        </label>
        
        <button type="submit" class="auth-submit-btn" ${isSubmitting ? "disabled" : ""}>
          ${isSubmitting ? `<div class="spinner"></div> Updating...` : "Update Password"}
        </button>
      </form>
    `;
  }

  // Render Page Shell
  return `
    ${stylesHtml}
    <section class="content-section auth-section" style="background: var(--ivory); padding: clamp(48px, 8vw, 100px) 24px; min-height: calc(100vh - var(--header-height) - 100px); display: grid; place-items: center;">
      <div class="auth-container" style="max-width: ${authMode === 'signup' ? '820px' : '440px'};">
        <div class="auth-card">
          
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: var(--font-serif); font-size: clamp(28px, 4vw, 36px); color: var(--navy); font-weight: 700; margin: 0 0 10px 0;">${titleText}</h1>
            <p style="color: var(--ink-soft); font-size: 13px; line-height: 1.6; margin: 0; max-width: 360px; margin-left: auto; margin-right: auto;">${subtitleText}</p>
          </div>

          ${authError ? `
            <div style="background: #fff1f0; border: 1.5px solid #ffa39e; border-radius: 6px; padding: 14px 18px; color: #cf1322; font-size: 13px; margin-bottom: 24px; display: flex; align-items: start; gap: 10px; line-height: 1.5;">
              <span style="color: #cf1322; flex-shrink: 0; margin-top: 2px;">${icon("alert-circle", 16)}</span>
              <span>${escapeHtml(authError)}</span>
            </div>
          ` : ""}

          ${formContentHtml}

        </div>
      </div>
    </section>
  `;
}

// Bind Auth Delegates
export function initAuthDelegates() {
  // Bind Google OAuth button triggers
  document.querySelectorAll(".google-login-trigger-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const { loginWithGoogle } = await import("../services/store.js");
      await loginWithGoogle();
    });
  });

  // Navigation Toggles
  const forgotBtn = document.getElementById("toForgotTabBtn");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", () => {
      authMode = "forgot";
      authError = "";
      triggerRender();
    });
  }

  const signinBtns = document.querySelectorAll("#toSignInTabBtn");
  signinBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      authMode = "signin";
      authError = "";
      triggerRender();
    });
  });

  const signupBtn = document.getElementById("toSignUpTabBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      authMode = "signup";
      authError = "";
      triggerRender();
    });
  }

  // 1. Sign In Form Submission
  const loginForm = document.getElementById("customerLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const email = formData.get("email");
      const password = formData.get("password");

      isSubmitting = true;
      authError = "";
      triggerRender();

      const success = await login(email, password);
      isSubmitting = false;

      if (success) {
        // Redirect: If Admin -> admin portal, else customer account
        const { currentUser } = await import("../services/store.js");
        if (currentUser && currentUser.role === "admin") {
          window.location.hash = "#/admin-dashboard";
        } else {
          // Redirect straight to cart page if they signed in to check out a pending item
          const hasPending = sessionStorage.getItem("godavari_pending_cart_item");
          if (hasPending) {
            window.location.hash = "#/cart";
          } else {
            window.location.hash = "#/account";
          }
        }
      } else {
        authError = "Invalid email or password. New user? Please click 'Create Account' below to sign up first.";
        triggerRender();
      }
    });
  }

  // 2. Registration Sign Up Submission
  const registerForm = document.getElementById("customerRegisterForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const email = formData.get("email");
      const password = formData.get("password");
      const name = formData.get("name");
      const phone = formData.get("phone");

      const addressFields = {
        addressLine1: formData.get("addressLine1"),
        addressLine2: formData.get("addressLine2"),
        city: formData.get("city"),
        state: formData.get("state"),
        country: formData.get("country"),
        postalCode: formData.get("postalCode")
      };

      if (password.length < 6) {
        authError = "Password must be at least 6 characters.";
        triggerRender();
        return;
      }

      isSubmitting = true;
      authError = "";
      triggerRender();

      const success = await register(email, password, name, phone, addressFields);
      isSubmitting = false;

      if (success) {
        // Redirect back to the website homepage or cart page on first time signup
        const hasPending = sessionStorage.getItem("godavari_pending_cart_item");
        if (hasPending) {
          window.location.hash = "#/cart";
        } else {
          window.location.hash = "#/";
        }
      } else {
        authError = "Registration failed. Email might already be registered.";
        triggerRender();
      }
    });
  }

  // 3. Password Reset Form Submission
  const forgotForm = document.getElementById("forgotPasswordForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(forgotForm);
      const email = formData.get("email");

      isSubmitting = true;
      authError = "";
      triggerRender();

      try {
        // Check if the user is registered with Google OAuth
        let isGoogleUser = false;
        try {
          initSupabase();
          const { data: profile } = await supabase
            .from('profiles')
            .select('auth_provider')
            .eq('email', email)
            .maybeSingle();
          if (profile && profile.auth_provider === 'google') {
            isGoogleUser = true;
          }
        } catch (dbErr) {
          console.warn("Failed to check auth_provider on password reset request:", dbErr);
        }

        if (isGoogleUser) {
          throw new Error("Password recovery is not available for Google Sign-In accounts. Please log in with Google.");
        }

        await authService.sendPasswordResetEmail(email);
        showToast(`Reset email instructions sent to ${email}`);
        authMode = "signin";
      } catch (err) {
        authError = err.message || "Failed to request password reset.";
      } finally {
        isSubmitting = false;
        triggerRender();
      }
    });
  }

  // 4. Password Reset Confirm Form Submission
  const confirmForm = document.getElementById("resetPasswordConfirmForm");
  if (confirmForm) {
    confirmForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(confirmForm);
      const password = formData.get("password");

      if (password.length < 6) {
        authError = "Password must be at least 6 characters.";
        triggerRender();
        return;
      }

      isSubmitting = true;
      authError = "";
      triggerRender();

      try {
        await authService.updatePassword(password);
        showToast("Password updated successfully! Please sign in.");
        
        // Remove mode parameter from hash to prevent re-entering confirm view
        window.history.replaceState(null, "", "#/auth");
        resetConfirmModeLoaded = false;
        authMode = "signin";
      } catch (err) {
        authError = err.message || "Failed to update password.";
      } finally {
        isSubmitting = false;
        triggerRender();
      }
    });
  }
}
