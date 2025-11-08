import type { Meta, StoryObj } from "@storybook/svelte";
import SharePanelPreview from "./SharePanelPreview.svelte";

const meta = {
  title: "Create/Panels/SharePanel Preview",
  component: SharePanelPreview as any,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0a0e14" },
      ],
    },
  },
} satisfies Meta<SharePanelPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
