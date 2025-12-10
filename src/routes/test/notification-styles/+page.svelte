<!--
  Notification Styling Demo
  Compare multiple design options for notification cards
-->
<script lang="ts">
  import { NOTIFICATION_TYPE_CONFIG } from "$lib/features/feedback/domain/models/notification-models";
  import type { NotificationType } from "$lib/features/feedback/domain/models/notification-models";

  const notificationTypes: NotificationType[] = [
    "feedback-resolved",
    "feedback-in-progress",
    "feedback-needs-info",
    "feedback-response",
    "sequence-liked",
    "user-followed",
    "admin-new-user-signup",
  ];

  const mockMessages: Record<NotificationType, string> = {
    "feedback-resolved": "Your feedback has been implemented and is now live!",
    "feedback-in-progress": "The team is working on your feedback request.",
    "feedback-needs-info": "We need more details about your request.",
    "feedback-response": "The team replied to your feedback with updates.",
    "sequence-liked": "Someone loved your animation sequence!",
    "user-followed": "Nina Salem started following you.",
    "achievement-unlocked": "You unlocked the 'Creator' achievement!",
    "admin-new-user-signup": "New user signed up: Nina Salem",
    "system-announcement": "Important system update available.",
  };

  const styles = [
    {
      name: "Colored Background (Current)",
      id: "colored-bg",
      description: "Subtle colored background with matching border",
    },
    {
      name: "Outline Only",
      id: "outline-only",
      description: "Just colored borders, minimal background",
    },
    {
      name: "Left Stripe Accent",
      id: "left-stripe",
      description: "Colored left border accent, subtle background",
    },
    {
      name: "Dark Solid",
      id: "dark-solid",
      description: "Dark backgrounds with bright text accent",
    },
    {
      name: "Gradient",
      id: "gradient",
      description: "Subtle gradient backgrounds",
    },
    {
      name: "Icon Accent",
      id: "icon-accent",
      description: "Large colored icon with minimal card",
    },
  ];

  let selectedStyle = $state("colored-bg");

  function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
</script>

<div class="demo-container">
  <div class="demo-header">
    <h1>Notification Style Options</h1>
    <p>Select a style to see all notification types</p>
  </div>

  <div class="style-selector">
    {#each styles as style}
      <button
        class="style-button"
        class:active={selectedStyle === style.id}
        onclick={() => (selectedStyle = style.id)}
      >
        <div class="style-name">{style.name}</div>
        <div class="style-desc">{style.description}</div>
      </button>
    {/each}
  </div>

  <div class="demo-content">
    {#if selectedStyle === "colored-bg"}
      <div class="style-demo colored-bg">
        {#each notificationTypes as type}
          {@const config = NOTIFICATION_TYPE_CONFIG[type]}
          {@const rgb = hexToRgb(config.color)}
          <div
            class="notification-item"
            style="background: rgba({rgb.r}, {rgb.g}, {rgb.b}, 0.08); border-color: rgba({rgb.r}, {rgb.g}, {rgb.b}, 0.2);"
          >
            <div class="notification-icon" style="background: {config.color};">
              <i class="fas {config.icon}"></i>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-label">{config.label}</span>
                <span class="notification-time">10h ago</span>
              </div>
              <p class="notification-message">{mockMessages[type]}</p>
            </div>
            <button class="notification-action">{config.actionLabel}</button>
          </div>
        {/each}
      </div>
    {:else if selectedStyle === "outline-only"}
      <div class="style-demo outline-only">
        {#each notificationTypes as type}
          {@const config = NOTIFICATION_TYPE_CONFIG[type]}
          {@const rgb = hexToRgb(config.color)}
          <div
            class="notification-item"
            style="background: rgba(255, 255, 255, 0.01); border-color: {config.color}; border-width: 1.5px;"
          >
            <div class="notification-icon" style="background: rgba({rgb.r}, {rgb.g}, {rgb.b}, 0.15);">
              <i class="fas {config.icon}" style="color: {config.color};"></i>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-label" style="color: {config.color};">{config.label}</span>
                <span class="notification-time">10h ago</span>
              </div>
              <p class="notification-message">{mockMessages[type]}</p>
            </div>
            <button class="notification-action" style="background: {config.color};">{config.actionLabel}</button>
          </div>
        {/each}
      </div>
    {:else if selectedStyle === "left-stripe"}
      <div class="style-demo left-stripe">
        {#each notificationTypes as type}
          {@const config = NOTIFICATION_TYPE_CONFIG[type]}
          {@const rgb = hexToRgb(config.color)}
          <div
            class="notification-item"
            style="background: rgba({rgb.r}, {rgb.g}, {rgb.b}, 0.05); border-left: 4px solid {config.color};"
          >
            <div class="notification-icon" style="background: {config.color};">
              <i class="fas {config.icon}"></i>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-label">{config.label}</span>
                <span class="notification-time">10h ago</span>
              </div>
              <p class="notification-message">{mockMessages[type]}</p>
            </div>
            <button class="notification-action">{config.actionLabel}</button>
          </div>
        {/each}
      </div>
    {:else if selectedStyle === "dark-solid"}
      <div class="style-demo dark-solid">
        {#each notificationTypes as type}
          {@const config = NOTIFICATION_TYPE_CONFIG[type]}
          <div class="notification-item" style="background: rgba(0, 0, 0, 0.4); border: 1px solid {config.color};">
            <div class="notification-icon" style="background: {config.color};">
              <i class="fas {config.icon}"></i>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-label" style="color: {config.color};">{config.label}</span>
                <span class="notification-time">10h ago</span>
              </div>
              <p class="notification-message">{mockMessages[type]}</p>
            </div>
            <button class="notification-action" style="background: {config.color};">{config.actionLabel}</button>
          </div>
        {/each}
      </div>
    {:else if selectedStyle === "gradient"}
      <div class="style-demo gradient">
        {#each notificationTypes as type}
          {@const config = NOTIFICATION_TYPE_CONFIG[type]}
          {@const rgb = hexToRgb(config.color)}
          <div
            class="notification-item"
            style="background: linear-gradient(135deg, rgba({rgb.r}, {rgb.g}, {rgb.b}, 0.12) 0%, rgba({rgb.r}, {rgb.g}, {rgb.b}, 0.04) 100%); border-color: rgba({rgb.r}, {rgb.g}, {rgb.b}, 0.25);"
          >
            <div class="notification-icon" style="background: {config.color};">
              <i class="fas {config.icon}"></i>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-label">{config.label}</span>
                <span class="notification-time">10h ago</span>
              </div>
              <p class="notification-message">{mockMessages[type]}</p>
            </div>
            <button class="notification-action">{config.actionLabel}</button>
          </div>
        {/each}
      </div>
    {:else if selectedStyle === "icon-accent"}
      <div class="style-demo icon-accent">
        {#each notificationTypes as type}
          {@const config = NOTIFICATION_TYPE_CONFIG[type]}
          {@const rgb = hexToRgb(config.color)}
          <div
            class="notification-item"
            style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08);"
          >
            <div class="notification-icon" style="background: {config.color}; font-size: 20px;">
              <i class="fas {config.icon}"></i>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-label">{config.label}</span>
                <span class="notification-time">10h ago</span>
              </div>
              <p class="notification-message">{mockMessages[type]}</p>
            </div>
            <button class="notification-action">{config.actionLabel}</button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .demo-container {
    width: 100%;
    height: 100%;
    padding: 40px;
    overflow-y: auto;
    background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  }

  .demo-header {
    margin-bottom: 40px;
    text-align: center;
  }

  .demo-header h1 {
    font-size: 2.5rem;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 8px 0;
    font-weight: 700;
  }

  .demo-header p {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }

  .style-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    margin-bottom: 40px;
  }

  .style-button {
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .style-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .style-button.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
  }

  .style-name {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 6px;
  }

  .style-desc {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .demo-content {
    max-width: 900px;
  }

  .style-demo {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .notification-item {
    display: flex;
    gap: 12px;
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .notification-item:hover {
    filter: brightness(1.1);
  }

  .notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-header {
    display: flex;
    gap: 8px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .notification-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .notification-time {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }

  .notification-message {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.4;
  }

  .notification-action {
    padding: 6px 14px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .notification-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .colored-bg .notification-item {
    border: 1px solid;
  }

  .outline-only .notification-item {
    border: 1px solid;
  }

  .left-stripe .notification-item {
    border: none;
    border-left: 4px solid;
  }

  .dark-solid .notification-item {
    border: 1.5px solid;
  }

  .gradient .notification-item {
    border: 1px solid;
  }

  .icon-accent .notification-item {
    border: 1px solid;
  }

  .icon-accent .notification-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
</style>
