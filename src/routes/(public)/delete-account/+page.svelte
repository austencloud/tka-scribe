<script lang="ts">
  const steps = [
    'Open TKA Scribe and sign in to your account',
    'Tap your profile icon in the bottom navigation',
    'Go to Settings (gear icon)',
    'Scroll to "Account" section',
    'Tap "Delete Account"',
    'Confirm deletion when prompted'
  ];

  const deletedData = [
    'Your profile information (name, email, profile picture)',
    'Your library and personal collections',
    'Settings and preferences',
    'Achievement progress and XP',
    'All associated activity data'
  ];

  const sequenceOptions = [
    'Anonymize: Your sequences show "Anonymous" as the creator',
    'Keep name: Your sequences continue to display your name',
    'You\'ll choose your preference during the deletion process'
  ];

  const whySequencesStay = [
    'Sequences are part of the shared community knowledge base',
    'Other users may have favorited, studied, or built upon your work',
    'Removing sequences would break references and affect other accounts'
  ];
</script>

<svelte:head>
  <title>Delete Account - TKA Scribe</title>
  <meta name="description" content="How to delete your TKA Scribe account and data" />
</svelte:head>

<div class="container">
  <div class="header">
    <h1>Delete Your Account</h1>
    <p class="subtitle">TKA Scribe Account Deletion</p>
  </div>

  <div class="content-grid">
    <section class="full-width">
      <h2>How to Delete Your Account</h2>
      <ol>
        {#each steps as step}
          <li>{step}</li>
        {/each}
      </ol>
    </section>

    <section>
      <h2>What Gets Deleted</h2>
      <p>When you delete your account, the following data is permanently removed:</p>
      <ul>
        {#each deletedData as item}
          <li>{item}</li>
        {/each}
      </ul>
    </section>

    <section class="choice">
      <h2>Your Sequences Stay</h2>
      <p>Sequences you created remain in the gallery. You choose how they're credited:</p>
      <ul>
        {#each sequenceOptions as option}
          <li>{option}</li>
        {/each}
      </ul>
    </section>

    <section class="info">
      <h2>Why Sequences Aren't Deleted</h2>
      <ul>
        {#each whySequencesStay as reason}
          <li>{reason}</li>
        {/each}
      </ul>
    </section>

    <section class="warning full-width">
      <h2>Important Information</h2>
      <ul>
        <li><strong>This action is permanent</strong> and cannot be undone</li>
        <li>Data deletion is processed immediately</li>
        <li>You will be signed out automatically after deletion</li>
      </ul>
    </section>

    <section class="full-width">
      <h2>Need Help?</h2>
      <p>
        If you're unable to access your account or need assistance with deletion,
        contact us at <a href="mailto:support@tkascribe.com">support@tkascribe.com</a>
      </p>
    </section>

    <div class="cta">
      <a href="/app" class="button">Open TKA Scribe</a>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    font-family: system-ui, -apple-system, sans-serif;
    color: #e5e5e5;
    line-height: 1.7;
    background: #0a0a0f;
    min-height: 100vh;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #ffffff;
    font-weight: 600;
  }

  .subtitle {
    color: #888;
    margin-bottom: 0;
    font-size: 1.125rem;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .content-grid {
      grid-template-columns: 1fr 1fr;
    }

    .full-width {
      grid-column: 1 / -1;
    }
  }

  h2 {
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 1rem;
    color: #ffffff;
    font-weight: 600;
  }

  section {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  ol, ul {
    padding-left: 1.25rem;
    margin: 0;
  }

  li {
    margin-bottom: 0.6rem;
    color: #c5c5c5;
  }

  li::marker {
    color: #6366f1;
  }

  p {
    color: #b5b5b5;
    margin-bottom: 1rem;
  }

  a {
    color: #818cf8;
  }

  a:hover {
    color: #a5b4fc;
  }

  .choice {
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .choice h2 {
    color: #a5b4fc;
  }

  .choice li {
    color: #c7d2fe;
  }

  .choice li::marker {
    color: #818cf8;
  }

  .info {
    background: rgba(148, 163, 184, 0.08);
    border-color: rgba(148, 163, 184, 0.2);
  }

  .info h2 {
    color: #94a3b8;
  }

  .info li {
    color: #cbd5e1;
  }

  .info li::marker {
    color: #64748b;
  }

  .warning {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
  }

  .warning li {
    color: #fca5a5;
  }

  .warning h2 {
    color: #f87171;
  }

  strong {
    color: #f87171;
    font-weight: 600;
  }

  .cta {
    margin-top: 2rem;
    text-align: center;
    grid-column: 1 / -1;
  }

  .button {
    display: inline-block;
    background: #6366f1;
    color: white;
    padding: 1rem 3rem;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 500;
    font-size: 1.125rem;
    transition: background 0.2s;
  }

  .button:hover {
    background: #4f46e5;
    color: white;
  }

  @media (max-width: 767px) {
    h1 {
      font-size: 1.75rem;
    }

    .container {
      padding: 1.5rem 1rem;
    }

    section {
      padding: 1.25rem;
    }
  }
</style>
