"""
Geometric Measurement Logger for Option Picker Header Button Centering Analysis

This module provides precise coordinate logging and centering verification for
Option Picker section header buttons to achieve mathematical proof of perfect centering.
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from PyQt6.QtWidgets import QWidget, QPushButton, QFrame
from PyQt6.QtCore import QRect, QPoint


@dataclass
class GeometricMeasurement:
    """Container for geometric measurements of a UI element."""

    name: str
    left: int
    right: int
    top: int
    bottom: int
    center_x: int
    center_y: int
    width: int
    height: int


@dataclass
class CenteringAnalysis:
    """Container for centering analysis results."""

    section_name: str
    container: GeometricMeasurement
    button: GeometricMeasurement
    left_distance: float
    right_distance: float
    centering_offset: float
    deviation_percentage: float
    is_perfectly_centered: bool


class GeometricMeasurementLogger:
    """
    Provides precise geometric measurement logging for Option Picker components.

    This class captures exact coordinates, calculates centering metrics, and provides
    mathematical verification of header button centering accuracy.
    """

    def __init__(self):
        self.measurements: Dict[str, GeometricMeasurement] = {}
        self.centering_analyses: List[CenteringAnalysis] = []
        self.tolerance_pixels = 1  # Tolerance for "perfect" centering

    def capture_widget_geometry(
        self, widget: QWidget, name: str
    ) -> GeometricMeasurement:
        """
        Capture precise geometric measurements of a widget.

        Args:
            widget: The QWidget to measure
            name: Identifier name for the measurement

        Returns:
            GeometricMeasurement object with all coordinate data
        """
        if not widget or not widget.isVisible():
            print(f"⚠️  WARNING: Widget '{name}' is not visible or None")
            return GeometricMeasurement(name, 0, 0, 0, 0, 0, 0, 0, 0)

        # Get widget geometry in global coordinates
        global_rect = widget.geometry()
        if widget.parent():
            parent_pos = widget.parent().mapToGlobal(QPoint(0, 0))
            global_rect.moveTopLeft(parent_pos + global_rect.topLeft())

        # Calculate all measurements
        left = global_rect.left()
        right = global_rect.right()
        top = global_rect.top()
        bottom = global_rect.bottom()
        center_x = left + (global_rect.width() // 2)
        center_y = top + (global_rect.height() // 2)
        width = global_rect.width()
        height = global_rect.height()

        measurement = GeometricMeasurement(
            name=name,
            left=left,
            right=right,
            top=top,
            bottom=bottom,
            center_x=center_x,
            center_y=center_y,
            width=width,
            height=height,
        )

        self.measurements[name] = measurement

        print(f"📏 GEOMETRY CAPTURED: {name}")
        print(f"   Position: ({left}, {top}) to ({right}, {bottom})")
        print(f"   Center: ({center_x}, {center_y})")
        print(f"   Dimensions: {width}x{height}")

        return measurement

    def analyze_button_centering(
        self, container_name: str, button_name: str, section_name: str
    ) -> CenteringAnalysis:
        """
        Analyze the centering of a button within its container.

        Args:
            container_name: Name of the container measurement
            button_name: Name of the button measurement
            section_name: Name of the section for reporting

        Returns:
            CenteringAnalysis object with detailed centering metrics
        """
        if (
            container_name not in self.measurements
            or button_name not in self.measurements
        ):
            print(f"❌ ERROR: Missing measurements for centering analysis")
            print(
                f"   Container '{container_name}': {'✓' if container_name in self.measurements else '✗'}"
            )
            print(
                f"   Button '{button_name}': {'✓' if button_name in self.measurements else '✗'}"
            )
            return None

        container = self.measurements[container_name]
        button = self.measurements[button_name]

        # Calculate centering metrics
        container_center = container.left + (container.width / 2)
        button_center = button.center_x

        left_distance = button_center - container.left
        right_distance = container.right - button_center
        centering_offset = left_distance - right_distance

        # Calculate percentage deviation
        if container.width > 0:
            deviation_percentage = abs(centering_offset) / (container.width / 2) * 100
        else:
            deviation_percentage = 0

        is_perfectly_centered = abs(centering_offset) <= self.tolerance_pixels

        analysis = CenteringAnalysis(
            section_name=section_name,
            container=container,
            button=button,
            left_distance=left_distance,
            right_distance=right_distance,
            centering_offset=centering_offset,
            deviation_percentage=deviation_percentage,
            is_perfectly_centered=is_perfectly_centered,
        )

        self.centering_analyses.append(analysis)
        return analysis

    def log_centering_analysis(self, analysis: CenteringAnalysis) -> None:
        """
        Log detailed centering analysis in structured format.

        Args:
            analysis: CenteringAnalysis object to log
        """
        if not analysis:
            return

        print(f"\n🎯 CENTERING ANALYSIS: {analysis.section_name}")
        print(f"{'='*60}")

        # Container measurements
        print(
            f"Container: left={analysis.container.left}, right={analysis.container.right}, "
            f"center={analysis.container.center_x}, width={analysis.container.width}"
        )

        # Button measurements
        print(
            f"Button: left={analysis.button.left}, right={analysis.button.right}, "
            f"center={analysis.button.center_x}, width={analysis.button.width}"
        )

        # Centering metrics
        print(
            f"Centering: offset={analysis.centering_offset:.1f} pixels, "
            f"deviation={analysis.deviation_percentage:.2f}%"
        )

        # Distance breakdown
        print(
            f"Distances: left={analysis.left_distance:.1f}px, right={analysis.right_distance:.1f}px"
        )

        # Centering status
        status = (
            "✅ PERFECTLY CENTERED"
            if analysis.is_perfectly_centered
            else "❌ OFF-CENTER"
        )
        print(f"Status: {status}")

        if not analysis.is_perfectly_centered:
            direction = "RIGHT" if analysis.centering_offset > 0 else "LEFT"
            print(
                f"   Button is {abs(analysis.centering_offset):.1f}px too far {direction}"
            )

    def log_summary_report(self) -> None:
        """Log a comprehensive summary of all centering analyses."""
        print(f"\n📊 CENTERING SUMMARY REPORT")
        print(f"{'='*80}")

        total_sections = len(self.centering_analyses)
        perfectly_centered = sum(
            1 for a in self.centering_analyses if a.is_perfectly_centered
        )

        print(f"Total sections analyzed: {total_sections}")
        print(f"Perfectly centered: {perfectly_centered}")
        print(f"Off-center: {total_sections - perfectly_centered}")
        print(
            f"Success rate: {(perfectly_centered/total_sections*100):.1f}%"
            if total_sections > 0
            else "N/A"
        )

        if total_sections > 0:
            avg_offset = (
                sum(abs(a.centering_offset) for a in self.centering_analyses)
                / total_sections
            )
            max_offset = max(abs(a.centering_offset) for a in self.centering_analyses)
            print(f"Average offset: {avg_offset:.2f}px")
            print(f"Maximum offset: {max_offset:.2f}px")

        print(f"\n🔍 DETAILED BREAKDOWN:")
        for analysis in self.centering_analyses:
            status_icon = "✅" if analysis.is_perfectly_centered else "❌"
            print(
                f"   {status_icon} {analysis.section_name}: {analysis.centering_offset:+.1f}px "
                f"({analysis.deviation_percentage:.2f}%)"
            )

    def clear_measurements(self) -> None:
        """Clear all stored measurements and analyses."""
        self.measurements.clear()
        self.centering_analyses.clear()
        print("🧹 Cleared all measurements and analyses")
