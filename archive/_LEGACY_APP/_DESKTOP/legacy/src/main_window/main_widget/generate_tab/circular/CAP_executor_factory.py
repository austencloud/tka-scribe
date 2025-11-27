from main_window.main_widget.generate_tab.circular.CAP_executors.rotated_inverted_CAP_executor import (
    RotatedInvertedCAPExecutor,
)
from .CAP_executors.CAP_executor import CAPExecutor
from .CAP_executors.mirrored_swapped_CAP_executor import MirroredSwappedCAPExecutor
from .CAP_executors.swapped_inverted_CAP_executor import (
    SwappedInvertedCAPExecutor,
)
from .CAP_type import CAPType
from .CAP_executors.strict_mirrored_CAP_executor import StrictMirroredCAPExecutor
from .CAP_executors.strict_rotated_CAP_executor import StrictRotatedCAPExecutor
from .CAP_executors.strict_swapped_CAP_executor import StrictSwappedCAPExecutor
from .CAP_executors.strict_inverted_CAP_executor import (
    StrictInvertedCAPExecutor,
)
from .CAP_executors.mirrored_inverted_CAP_executor import (
    MirroredInvertedCAPExecutor,
)
from .CAP_executors.rotated_swapped_CAP_executor import RotatedSwappedCAPExecutor

# from .CAP_executors.rotated_swapped_inverted_CAP_executor import RotatedSwappedInvertedCAPExecutor
# from .CAP_executors.mirrored_swapped_inverted_CAP_executor import MirroredSwappedInvertedCAPExecutor
# from .CAP_executors.mirrored_rotated_swapped_CAP_executor import MirroredRotatedSwappedCAPExecutor
# from .CAP_executors.mirrored_rotated_inverted_swapped_CAP_executor import MirroredRotatedInvertedSwappedCAPExecutor


class CAPExecutorFactory:
    _executor_map = {
        CAPType.STRICT_MIRRORED: StrictMirroredCAPExecutor,
        CAPType.STRICT_ROTATED: StrictRotatedCAPExecutor,
        CAPType.STRICT_SWAPPED: StrictSwappedCAPExecutor,
        CAPType.MIRRORED_SWAPPED: MirroredSwappedCAPExecutor,
        CAPType.SWAPPED_INVERTED: SwappedInvertedCAPExecutor,
        CAPType.STRICT_INVERTED: StrictInvertedCAPExecutor,
        CAPType.ROTATED_INVERTED: RotatedInvertedCAPExecutor,
        CAPType.MIRRORED_INVERTED: MirroredInvertedCAPExecutor,
        CAPType.ROTATED_SWAPPED: RotatedSwappedCAPExecutor,
        CAPType.MIRRORED_ROTATED: StrictMirroredCAPExecutor,
        CAPType.MIRRORED_INVERTED_ROTATED: MirroredInvertedCAPExecutor,
        # CAPType.ROTATED_SWAPPED_INVERTED: RotatedSwappedInvertedCAPExecutor,
        # CAPType.MIRRORED_SWAPPED_INVERTED: MirroredSwappedInvertedCAPExecutor,
        # CAPType.MIRRORED_ROTATED_SWAPPED: MirroredRotatedSwappedCAPExecutor,
        # CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED: MirroredRotatedInvertedSwappedCAPExecutor,
    }

    @staticmethod
    def create_executor(cap_type: CAPType, circular_sequence_generator) -> CAPExecutor:
        executor_class = CAPExecutorFactory._executor_map.get(cap_type)
        if executor_class:
            return executor_class(circular_sequence_generator)
        else:
            raise ValueError(f"Unknown CAPType: {cap_type}")
