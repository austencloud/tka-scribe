<script lang="ts">
  /**
   * MFASuccessStep
   *
   * Success confirmation after MFA enrollment is complete.
   */

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();
</script>

<div class="success-step">
  <div class="success-icon">
    <i class="fas fa-shield-check"></i>
  </div>

  <h3>Two-Factor Authentication Enabled</h3>

  <p class="message">
    Your account is now protected with two-factor authentication.
    You'll need to enter a code from your authenticator app each time you sign in.
  </p>

  <div class="tips">
    <h4>Important Tips</h4>
    <ul>
      <li>
        <i class="fas fa-mobile-alt"></i>
        Keep your authenticator app installed
      </li>
      <li>
        <i class="fas fa-key"></i>
        Save your backup codes in a safe place
      </li>
      <li>
        <i class="fas fa-sync"></i>
        If you change phones, transfer your authenticator first
      </li>
    </ul>
  </div>

  <button type="button" class="done-button" onclick={onClose}>
    Done
    <i class="fas fa-check"></i>
  </button>
</div>

<style>
  .success-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 24px 16px;
    text-align: center;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--semantic-success, #22c55e), color-mix(in srgb, var(--semantic-success, #22c55e) 70%, #000));
    border-radius: 50%;
    color: #ffffff;
    font-size: 36px;
    animation: scaleIn 0.3s ease;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .message {
    margin: 0;
    font-size: 14px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
    max-width: 300px;
    line-height: 1.5;
  }

  .tips {
    width: 100%;
    max-width: 320px;
    padding: 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    text-align: left;
  }

  .tips h4 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .tips ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tips li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
  }

  .tips li i {
    width: 20px;
    color: var(--theme-accent, #3b82f6);
  }

  .done-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: linear-gradient(135deg, var(--semantic-success, #22c55e), color-mix(in srgb, var(--semantic-success, #22c55e) 80%, #000));
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .done-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--semantic-success, #22c55e) 40%, transparent);
  }
</style>
