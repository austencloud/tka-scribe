import type { Meta, StoryObj } from "@storybook/svelte";
import type { ComponentProps } from "svelte";
import PanelHeader from "../../lib/features/create/shared/components/PanelHeader.svelte";

type PanelHeaderProps = ComponentProps<typeof PanelHeader>;

const meta = {
  title: "Create/Panels/PanelHeader",
  component: PanelHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0f141e" },
        { name: "darker", value: "#000000" },
      ],
    },
  },
  argTypes: {
    onClose: { action: "close" },
  },
} satisfies Meta<PanelHeaderProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Edit Panel",
    isMobile: false,
    onClose: () => {},
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Edit Panel",
    subtitle: "Beat #3",
    isMobile: false,
    onClose: () => {},
  },
};

export const Mobile: Story = {
  args: {
    title: "Animation Viewer",
    isMobile: true,
    onClose: () => {},
  },
};

export const WithActionButtons: Story = {
  args: {
    title: "Animation Viewer",
    isMobile: false,
    onClose: () => {},
  },
  // Note: actionButtons snippet would need to be passed in component usage
};
