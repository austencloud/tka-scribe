import type { PictographData } from "../../../../../../shared";
import type { IOptionPickerService } from "../services";

// ===== Layout Types =====
export interface OptionPickerLayout {
  optionsPerRow: number;
  optionSize: number;
  gridGap: string;
  gridColumns: string;
  containerWidth: number;
  containerHeight: number;
}

// ===== Selection Types =====
export interface OptionSelection {
  option: PictographData;
  timestamp: number;
}



// ===== State Factory Config =====
export interface OptionPickerStateConfig {
  optionPickerService: IOptionPickerService;
}
