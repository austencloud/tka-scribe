import type { Meta, StoryObj } from "@storybook/svelte";
import SubtleInstallBanner from "../../lib/shared/mobile/components/SubtleInstallBanner.svelte";

const meta = {
  title: "PWA/SubtleInstallBanner",
  component: SubtleInstallBanner as any,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0f172a" },
        { name: "darker", value: "#000000" },
      ],
    },
    docs: {
      description: {
        component:
          "Tier 1: Subtle, non-blocking banner that slides in from top after user meets engagement thresholds. Shows only after meaningful engagement and respects dismissal timing (7/30/90 days).",
      },
    },
  },
} satisfies Meta<SubtleInstallBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default banner showing the install prompt. The banner appears automatically based on user engagement and dismissal history.",
      },
    },
  },
};

export const WithMockState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "This story shows the banner with mocked service state. In production, the banner only appears when the user has met engagement thresholds and hasn't dismissed it recently.",
      },
    },
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Banner optimized for mobile devices with responsive layout adjustments.",
      },
    },
  },
};

export const SmallMobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
    docs: {
      description: {
        story:
          "Banner on very small screens (≤360px) where button text is hidden and only icons are shown.",
      },
    },
  },
};
