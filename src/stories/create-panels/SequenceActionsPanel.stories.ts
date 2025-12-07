import type { Meta, StoryObj } from "@storybook/svelte";
import SequenceActionsPanelWrapper from "./SequenceActionsPanelWrapper.svelte";

const meta = {
  title: "Create/Panels/SequenceActionsPanel",
  component: SequenceActionsPanelWrapper as any,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0a0e14" }],
    },
  },
} satisfies Meta<typeof SequenceActionsPanelWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
