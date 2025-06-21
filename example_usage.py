# Example usage of the new simplified data structure

# Python usage:
from data.types import MotionType, Location, PropType
from data.constants import API_BASE_URL, ENDPOINTS

# Simple, clean imports - no unnecessary dataclasses!
motion = MotionType.PRO
location = Location.NORTH
prop = PropType.STAFF

# Applications can define their own data structures as needed
sequence_data = {
    "id": "seq_001",
    "name": "Basic Flow",
    "motion_type": motion.value,
    "start_location": location.value,
}

print(f"Using {API_BASE_URL}{ENDPOINTS['sequences']}")
