<!-- SocialLinks.svelte - Social media links section -->
<script lang="ts">
  import { browser } from "$app/environment";
  import SocialIcons from "../icons/SocialIcons.svelte";

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/yourusername",
      icon: "github" as const,
      description: "Source code and project repositories",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@yourchannel",
      icon: "youtube" as const,
      description: "Tutorial videos and flow arts content",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/yourusername",
      icon: "instagram" as const,
      description: "Visual content and community updates",
    },
    {
      name: "Discord",
      url: "https://discord.gg/yourinvite",
      icon: "discord" as const,
      description: "Join our flow arts community",
    },
    {
      name: "Reddit",
      url: "https://reddit.com/r/flowarts",
      icon: "reddit" as const,
      description: "Flow arts discussions and sharing",
    },
    {
      name: "Email",
      url: "mailto:contact@kineticalphabetproject.com",
      icon: "email" as const,
      description: "Direct contact for inquiries",
    },
  ];

  function openSocialLink(url: string) {
    if (browser) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }
</script>

<div class="social-section">
  <h3>Connect & Follow</h3>
  <p>Join the community and stay updated with the latest developments:</p>

  <div class="social-grid">
    {#each socialLinks as social}
      <button
        class="social-link"
        onclick={() => openSocialLink(social.url)}
        type="button"
        title={social.description}
      >
        <div class="social-icon">
          <SocialIcons icon={social.icon} />
        </div>
        <div class="social-details">
          <span class="social-name">{social.name}</span>
          <span class="social-description">{social.description}</span>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .social-section {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
  }

  .social-section h3 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
  }

  .social-section p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
    line-height: 1.5;
  }

  .social-grid {
    display: grid;
    gap: var(--spacing-sm);
  }

  .social-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius);
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .social-link:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }

  .social-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: linear-gradient(
      135deg,
      var(--primary-color),
      var(--secondary-color)
    );
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .social-details {
    flex: 1;
    text-align: left;
  }

  .social-name {
    display: block;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 2px;
  }

  .social-description {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    .social-link {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-sm);
    }

    .social-link:hover {
      transform: none;
    }
  }
</style>
