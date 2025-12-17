<!--
  NotificationsTab.svelte - Notifications tab for Inbox module

  Displays all notifications with read/dismiss functionality.
  Wraps existing notification components for use in the module context.

  Note: Notifications are subscribed globally by InboxSubscriptionProvider.
  This tab just reads from inboxState - no direct subscription needed.
-->
<script lang="ts">
  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";
  import NotificationList from "$lib/shared/inbox/components/notifications/NotificationList.svelte";
</script>

<div class="notifications-tab">
  <NotificationList
    notifications={inboxState.notifications}
    isLoading={inboxState.isLoadingNotifications}
  />
</div>

<style>
  .notifications-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
</style>
