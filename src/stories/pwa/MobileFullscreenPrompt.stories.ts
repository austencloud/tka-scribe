import type { Meta, StoryObj } from "@storybook/svelte";
import MobileFullscreenPrompt from "$lib/shared/mobile/components/MobileFullscreenPrompt.svelte";

const meta = {
  title: "PWA/MobileFullscreenPrompt",
  component: MobileFullscreenPrompt as any,
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
  },
  argTypes: {
    showPrompt: {
      control: "boolean",
      description: "Whether to show the prompt",
    },
    autoShow: {
      control: "boolean",
      description: "Whether to automatically show the prompt after a delay",
    },
    position: {
      control: "select",
      options: ["top", "bottom", "center"],
      description: "Position of the prompt on screen",
    },
    nagMode: {
      control: "boolean",
      description:
        "Whether to use nag mode (shows reminder that will appear again later)",
    },
    onDismiss: { action: "dismiss" },
  },
} satisfies Meta<MobileFullscreenPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomPosition: Story = {
  args: {
    showPrompt: true,
    autoShow: false,
    position: "bottom",
    nagMode: false,
    onDismiss: () => {},
  },
};

export const TopPosition: Story = {
  args: {
    showPrompt: true,
    autoShow: false,
    position: "top",
    nagMode: false,
    onDismiss: () => {},
  },
};

export const CenterPosition: Story = {
  args: {
    showPrompt: true,
    autoShow: false,
    position: "center",
    nagMode: false,
    onDismiss: () => {},
  },
};

export const NagMode: Story = {
  args: {
    showPrompt: true,
    autoShow: false,
    position: "bottom",
    nagMode: true,
    onDismiss: () => {},
  },
};

export const Hidden: Story = {
  args: {
    showPrompt: false,
    autoShow: false,
    position: "bottom",
    nagMode: false,
    onDismiss: () => {},
  },
};

export const AutoShow: Story = {
  args: {
    showPrompt: false,
    autoShow: true,
    position: "bottom",
    nagMode: false,
    onDismiss: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story will automatically show the prompt after 2.5 seconds if the user should be prompted.",
      },
    },
  },
};
