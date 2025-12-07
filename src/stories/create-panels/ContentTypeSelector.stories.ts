import type { Meta, StoryObj } from "@storybook/svelte";
import type { ComponentProps } from "svelte";
import ContentTypeSelector from "$lib/shared/share/components/ContentTypeSelector.svelte";

type ContentTypeSelectorProps = ComponentProps<typeof ContentTypeSelector>;

const meta = {
  title: "Create/Share/ContentTypeSelector",
  component: ContentTypeSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0f141e" },
        {
          name: "panel",
          value:
            "linear-gradient(135deg, rgba(20, 25, 35, 0.98) 0%, rgba(15, 20, 30, 0.95) 100%)",
        },
      ],
    },
  },
} satisfies Meta<ContentTypeSelectorProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedTypes: ["image"],
  },
};

export const MultipleSelected: Story = {
  args: {
    selectedTypes: ["animation", "image"],
  },
};

export const NoneSelected: Story = {
  args: {
    selectedTypes: [],
  },
};

export const AllSelected: Story = {
  args: {
    selectedTypes: ["video", "animation", "image"],
  },
};
