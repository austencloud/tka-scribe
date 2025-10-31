<script lang="ts">
  /**
   * Email/Password Authentication Component
   *
   * Provides email/password sign-in and sign-up functionality
   */

  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    browserLocalPersistence,
    indexedDBLocalPersistence,
    setPersistence,
  } from "firebase/auth";
  import { auth } from "../firebase";
  import { goto } from "$app/navigation";

  let mode: "signin" | "signup" = $state("signin");
  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);

  async function handleSubmit() {
    loading = true;
    error = null;
    success = null;

    try {
      console.log(`🔐 [email] ${mode === "signin" ? "Signing in" : "Signing up"}...`);

      // Set persistence
      console.log(`🔐 [email] Setting persistence to IndexedDB...`);
      try {
        await setPersistence(auth, indexedDBLocalPersistence);
        console.log(`✅ [email] IndexedDB persistence set`);
      } catch (indexedDBErr) {
        await setPersistence(auth, browserLocalPersistence);
        console.log(`✅ [email] localStorage persistence set`);
      }

      if (mode === "signup") {
        // Sign up new user
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`✅ [email] User created:`, result.user.uid);

        // Send verification email
        await sendEmailVerification(result.user);
        success = "Account created! Please check your email to verify your account.";

        // Wait a bit before redirecting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        // Sign in existing user
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log(`✅ [email] User signed in:`, result.user.uid);
      }

      // Navigate to home
      console.log(`🔐 [email] Navigating to home page...`);
      goto("/");

    } catch (err: any) {
      console.error(`❌ [email] Auth error:`, err);
      console.error(`❌ [email] Error code:`, err.code);

      // Handle specific error codes
      if (err.code === "auth/email-already-in-use") {
        error = "This email is already registered. Try signing in instead.";
        mode = "signin";
      } else if (err.code === "auth/weak-password") {
        error = "Password is too weak. Use at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        error = "Invalid email address.";
      } else if (err.code === "auth/user-not-found") {
        error = "No account found with this email. Sign up instead?";
      } else if (err.code === "auth/wrong-password") {
        error = "Incorrect password.";
      } else if (err.code === "auth/invalid-credential") {
        error = "Invalid email or password.";
      } else {
        error = err.message || "An error occurred during authentication";
      }
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    mode = mode === "signin" ? "signup" : "signin";
    error = null;
    success = null;
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="email-auth-form">
  <div class="form-group">
    <label for="email">Email</label>
    <input
      id="email"
      type="email"
      bind:value={email}
      placeholder="you@example.com"
      required
      disabled={loading}
    />
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      bind:value={password}
      placeholder="••••••••"
      required
      disabled={loading}
      minlength="6"
    />
  </div>

  {#if error}
    <p class="error-message">{error}</p>
  {/if}

  {#if success}
    <p class="success-message">{success}</p>
  {/if}

  <button type="submit" disabled={loading} class="submit-button">
    {#if loading}
      <span class="spinner"></span>
    {/if}
    {mode === "signin" ? "Sign In" : "Sign Up"}
  </button>

  <button type="button" onclick={toggleMode} class="toggle-button" disabled={loading}>
    {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
  </button>
</form>

<style>
  .email-auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  input {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
  }

  .submit-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .toggle-button {
    padding: 0.5rem;
    background: transparent;
    color: #3b82f6;
    border: none;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-button:hover:not(:disabled) {
    color: #2563eb;
    text-decoration: underline;
  }

  .toggle-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    text-align: center;
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 0.5rem;
    margin: 0;
  }

  .success-message {
    color: #10b981;
    font-size: 0.875rem;
    text-align: center;
    padding: 0.75rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 0.5rem;
    margin: 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    label {
      color: #d1d5db;
    }

    input {
      background: #374151;
      border-color: #4b5563;
      color: white;
    }

    input:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
    }
  }
</style>
