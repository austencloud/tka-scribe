import type { Meta, StoryObj } from "@storybook/svelte";
import type { ComponentProps } from "svelte";
import PropTypePicker from "../../lib/shared/settings/components/tabs/prop-type/PropTypePicker.svelte";
import { PropType } from "../../lib/shared/pictograph/prop/domain/enums/PropType";

type PropTypePickerProps = ComponentProps<typeof PropTypePicker>;

const allPropTypes = [
  PropType.STAFF,
  PropType.SIMPLESTAFF,
  PropType.CLUB,
  PropType.FAN,
  PropType.TRIAD,
  PropType.MINIHOOP,
  PropType.BUUGENG,
  PropType.HAND,
  PropType.TRIQUETRA,
  PropType.SWORD,
  PropType.CHICKEN,
  PropType.GUITAR,
  PropType.DOUBLESTAR,
  PropType.EIGHTRINGS,
  PropType.QUIAD,
];

const meta = {
  title: "Settings/PropTypePicker",
  component: PropTypePicker,
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
    onSelect: { action: "select" },
    onClose: { action: "close" },
    onImageLoad: { action: "imageLoad" },
  },
} satisfies Meta<PropTypePickerProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleMode: Story = {
  args: {
    isOpen: true,
    catDogMode: false,
    currentHand: null,
    selectedBluePropType: PropType.STAFF,
    selectedRedPropType: PropType.STAFF,
    propTypes: allPropTypes,
    onSelect: () => {},
    onClose: () => {},
    shouldRotate: () => false,
    onImageLoad: () => {},
  },
};

export const CatDogModeBlueHand: Story = {
  args: {
    isOpen: true,
    catDogMode: true,
    currentHand: "blue",
    selectedBluePropType: PropType.STAFF,
    selectedRedPropType: PropType.FAN,
    propTypes: allPropTypes,
    onSelect: () => {},
    onClose: () => {},
    shouldRotate: () => false,
    onImageLoad: () => {},
  },
};

export const CatDogModeRedHand: Story = {
  args: {
    isOpen: true,
    catDogMode: true,
    currentHand: "red",
    selectedBluePropType: PropType.STAFF,
    selectedRedPropType: PropType.FAN,
    propTypes: allPropTypes,
    onSelect: () => {},
    onClose: () => {},
    shouldRotate: () => false,
    onImageLoad: () => {},
  },
};

export const WithDifferentSelections: Story = {
  args: {
    isOpen: true,
    catDogMode: true,
    currentHand: "blue",
    selectedBluePropType: PropType.TRIQUETRA,
    selectedRedPropType: PropType.CHICKEN,
    propTypes: allPropTypes,
    onSelect: () => {},
    onClose: () => {},
    shouldRotate: () => false,
    onImageLoad: () => {},
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    catDogMode: false,
    currentHand: null,
    selectedBluePropType: PropType.STAFF,
    selectedRedPropType: PropType.STAFF,
    propTypes: allPropTypes,
    onSelect: () => {},
    onClose: () => {},
    shouldRotate: () => false,
    onImageLoad: () => {},
  },
};
