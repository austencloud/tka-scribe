export type ContentType = "video" | "animation" | "image";

export type ContentTypeConfig = {
  type: ContentType;
  icon: string;
  label: string;
  description: string;
  color: string;
  disabled: boolean;
  comingSoon?: boolean;
};

export type ImageOptions = {
  addWord: boolean;
  addBeatNumbers: boolean;
  addUserInfo: boolean;
  addDifficultyLevel: boolean;
  includeStartPosition: boolean;
  format: "PNG" | "JPEG" | "WebP";
  quality: number;
};

export type ToggleOptionKey = Exclude<keyof ImageOptions, "format" | "quality">;

export type ActionVariant = "primary" | "secondary" | "instagram" | "facebook";

export type ActionConfig = {
  icon: string;
  label: string;
  variant: ActionVariant;
  disabled?: boolean;
  comingSoon?: boolean;
};
