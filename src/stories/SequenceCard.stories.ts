import type { Meta, StoryObj } from "@storybook/svelte";
import SequenceCard from "../lib/modules/explore/display/components/SequenceCard/SequenceCard.svelte";
import type { SequenceData } from "$shared";

const baseSequence: SequenceData = {
  id: "seq-001",
  name: "Aurora Wave",
  word: "Aurora Wave",
  beats: [],
  thumbnails: [],
  isFavorite: false,
  isCircular: false,
  tags: [],
  metadata: {},
  sequenceLength: 8,
};

const coverUrl =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop";

const meta = {
  title: "Explore/SequenceCard",
  component: SequenceCard,
  tags: ["autodocs"],
  args: {
    sequence: baseSequence,
    coverUrl,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<SequenceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Beginner: Story = {
  args: {
    sequence: { ...baseSequence, difficultyLevel: "beginner", level: 1 },
  },
};

export const Intermediate: Story = {
  args: {
    sequence: { ...baseSequence, difficultyLevel: "intermediate", level: 2 },
  },
};

export const Advanced: Story = {
  args: {
    sequence: { ...baseSequence, difficultyLevel: "advanced", level: 3 },
  },
};

export const Mythic: Story = {
  args: {
    sequence: { ...baseSequence, difficultyLevel: "mythic", level: 4, word: "Inferno Arc" },
  },
};

export const Legendary: Story = {
  args: {
    sequence: { ...baseSequence, difficultyLevel: "legendary", level: 5, word: "Celestial Nova" },
  },
};

export const Favorited: Story = {
  args: {
    sequence: { ...baseSequence, difficultyLevel: "advanced", level: 3 },
    isFavorite: true,
  },
};

export const NoImage: Story = {
  args: {
    sequence: { ...baseSequence, difficultyLevel: "intermediate", level: 2 },
    coverUrl: "",
  },
};
