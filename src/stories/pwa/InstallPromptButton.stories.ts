import type { Meta, StoryObj } from "@storybook/svelte";
import InstallPromptButton from "../../lib/shared/navigation/components/InstallPromptButton.svelte";

const meta = {
  title: "PWA/InstallPromptButton",
  component: InstallPromptButton as any,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
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
          "PWA Installation UI Component that displays a button to install the app as a PWA or show installation guide. Handles both native install prompts and fallback to instruction guide.",
      },
    },
  },
  argTypes: {
    canUseNativeInstall: {
      control: "boolean",
      description:
        "Whether the browser supports native PWA installation prompt",
    },
    onInstall: { action: "install" },
  },
} satisfies Meta<InstallPromptButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithNativeInstall: Story = {
  args: {
    canUseNativeInstall: true,
    onInstall: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows "Install App" button when the browser supports native PWA installation. Clicking triggers the native install prompt.',
      },
    },
  },
};

export const WithoutNativeInstall: Story = {
  args: {
    canUseNativeInstall: false,
    onInstall: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows "Add to Home Screen" button when native install is not available. Clicking opens the installation guide with platform-specific instructions.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    canUseNativeInstall: false,
    onInstall: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Button optimized for mobile devices. Most mobile browsers don't support native install prompts, so this typically shows the manual guide option.",
      },
    },
  },
};

export const DesktopView: Story = {
  args: {
    canUseNativeInstall: true,
    onInstall: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story:
          "Button on desktop browsers (Chrome/Edge) that typically support native installation. Shows the one-click install option.",
      },
    },
  },
};

export const InSettings: Story = {
  args: {
    canUseNativeInstall: false,
    onInstall: () => {},
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Example of the button as it appears in settings or profile panels. Full-width layout with gradient background and icon.",
      },
    },
  },
};
