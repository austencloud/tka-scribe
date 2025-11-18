import type { Meta, StoryObj } from "@storybook/svelte";
import PWAInstallGuide from "../../lib/shared/mobile/components/PWAInstallGuide.svelte";

const meta = {
  title: "PWA/PWAInstallGuide",
  component: PWAInstallGuide as any,
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
          "Device-specific installation guide that shows step-by-step instructions for installing TKA as a PWA for automatic fullscreen experience.",
      },
    },
  },
  argTypes: {
    showGuide: {
      control: "boolean",
      description: "Whether to show the installation guide",
    },
  },
} satisfies Meta<PWAInstallGuide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {
  args: {
    showGuide: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Installation guide opened as an overlay. The guide automatically detects the device and browser type to show relevant instructions.",
      },
    },
  },
};

export const Hidden: Story = {
  args: {
    showGuide: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Installation guide hidden (default state).",
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    showGuide: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Guide optimized for mobile devices with responsive adjustments. The guide will show platform-specific instructions based on detected device.",
      },
    },
  },
};

export const DesktopView: Story = {
  args: {
    showGuide: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story:
          "Guide shown on desktop with instructions for Chrome/Edge installation.",
      },
    },
  },
};
