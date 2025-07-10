class MoonPositioning:
    """Pure business logic for moon positioning - extracted from MoonManager"""
    
    def __init__(self):
        self.position_x_ratio = 0.85  # Upper right
        self.position_y_ratio = 0.05
        self.size_ratio = 0.12  # 12% of screen size
    
    def calculate_moon_position(self, screen_width: int, screen_height: int) -> tuple:
        """Calculate moon position and size based on screen dimensions"""
        size = int(min(screen_width, screen_height) * self.size_ratio)
        x = int(screen_width * self.position_x_ratio)
        y = int(screen_height * self.position_y_ratio)
        return x, y, size
    
    def get_crater_positions(self, moon_x: int, moon_y: int, moon_size: int) -> list:
        """Calculate crater positions for procedural moon"""
        crater_size = moon_size // 8
        craters = [
            (moon_x + moon_size // 3, moon_y + moon_size // 4, crater_size),
            (moon_x + moon_size // 2, moon_y + moon_size // 2, crater_size // 2),
            (moon_x + moon_size * 2 // 3, moon_y + moon_size // 3, crater_size * 3 // 4)
        ]
        return craters
    
    def set_position(self, x_ratio: float, y_ratio: float) -> None:
        """Set custom moon position ratios"""
        self.position_x_ratio = max(0, min(1, x_ratio))
        self.position_y_ratio = max(0, min(1, y_ratio))
    
    def set_size_ratio(self, size_ratio: float) -> None:
        """Set moon size ratio"""
        self.size_ratio = max(0.05, min(0.3, size_ratio))
    
    def reset(self) -> None:
        """Reset to default positioning"""
        self.position_x_ratio = 0.85
        self.position_y_ratio = 0.05
        self.size_ratio = 0.12
