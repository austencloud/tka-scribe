import type { Meta, StoryObj } from "@storybook/svelte";
import type { ComponentProps } from "svelte";
import EnhancedPWAInstallGuide from "$lib/shared/mobile/components/EnhancedPWAInstallGuide.svelte";

type EnhancedPWAInstallGuideProps = ComponentProps<typeof EnhancedPWAInstallGuide>;

const meta = {
  title: "PWA/EnhancedPWAInstallGuide",
  component: EnhancedPWAInstallGuide,
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
          "Polished PWA installation guide with intelligent device/browser detection, platform-specific screenshots, glass morphism styling, step-by-step visual guidance, and container-aware responsive layout. Refactored with composition and configuration-driven approach.",
      },
    },
  },
  argTypes: {
    showGuide: {
      control: "boolean",
      description: "Whether to show the installation guide",
    },
  },
} satisfies Meta<EnhancedPWAInstallGuideProps>;

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
          "Enhanced installation guide shown as a bottom sheet with glass morphism styling. Features intelligent device/browser detection and platform-specific instructions.",
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
        story: "Enhanced installation guide hidden (default state).",
      },
    },
  },
};

export const MobilePortrait: Story = {
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
          "Guide in mobile portrait mode with optimized bottom sheet layout. Uses dynamic viewport height (dvh) for proper mobile browser support.",
      },
    },
  },
};

export const MobileLandscape: Story = {
  args: {
    showGuide: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
    docs: {
      description: {
        story:
          "Guide in mobile landscape or small screen mode. Automatically switches to compact mode when vertical space is limited.",
      },
    },
  },
};

export const TabletView: Story = {
  args: {
    showGuide: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story:
          "Guide optimized for tablet screens with appropriate spacing and sizing.",
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
          "Guide on desktop with full feature set including desktop-specific installation instructions.",
      },
    },
  },
};

export const VerySmallScreen: Story = {
  args: {
    showGuide: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
      viewports: {
        mobile2: {
          name: "iPhone SE",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
      },
    },
    docs: {
      description: {
        story:
          "Guide on very small screens where compact mode is automatically enabled to maximize content visibility.",
      },
    },
  },
};
