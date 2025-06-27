# Modern Graph Editor Implementation Roadmap

## Executive Summary

This roadmap outlines the implementation plan for the modern TKA graph editor, ensuring feature parity with the legacy system while leveraging clean architecture principles and the reactive sizing patterns established in the option picker.

## Project Overview

### Objectives

- **Feature Parity**: Implement all legacy graph editor functionality
- **Modern Architecture**: Apply clean architecture with dependency injection
- **Performance**: Meet or exceed legacy performance benchmarks
- **Maintainability**: Create testable, modular components
- **User Experience**: Preserve intuitive interaction patterns

### Success Criteria

- [ ] All legacy features implemented and tested
- [ ] Performance benchmarks met (arrow selection < 100ms, animations < 400ms)
- [ ] 90%+ test coverage across all components
- [ ] Clean architecture compliance validated
- [ ] User acceptance testing passed

## Implementation Phases

### Phase 1: Foundation Architecture (Weeks 1-2)

**Priority: Critical | Effort: 40 hours**

#### Week 1: Service Layer & Interfaces

**Deliverables:**

- [ ] `IGraphEditorService` interface definition
- [ ] `GraphEditorService` implementation
- [ ] `IGraphEditorStateService` interface
- [ ] `GraphEditorStateService` implementation
- [ ] DI container registration

**Key Components:**

```python
# Core service interfaces
IGraphEditorService
IGraphEditorStateService
IAdjustmentService
IArrowSelectionService

# Service implementations
GraphEditorService
GraphEditorStateService
AdjustmentService
ArrowSelectionService
```

**Acceptance Criteria:**

- [ ] Services resolve correctly from DI container
- [ ] Basic state management working
- [ ] Service interfaces follow TKA patterns
- [ ] Unit tests for all services (>90% coverage)

#### Week 2: Core Components & Layout

**Deliverables:**

- [ ] `ModernGraphEditor` main component
- [ ] `GraphEditorPictographContainer` display component
- [ ] Basic layout management
- [ ] Reactive sizing integration

**Key Components:**

```python
# Main components
ModernGraphEditor(QFrame)
GraphEditorPictographContainer(QWidget)
ModernToggleTab(QWidget)

# Layout management
GraphEditorLayoutManager
ReactiveGraphEditorSizing
```

**Acceptance Criteria:**

- [ ] Components render correctly
- [ ] Reactive sizing working
- [ ] Layout responsive to window changes
- [ ] Integration with workbench complete

### Phase 2: Interaction System (Weeks 3-4)

**Priority: High | Effort: 50 hours**

#### Week 3: Arrow Selection & Visual Feedback

**Deliverables:**

- [ ] Arrow click detection system
- [ ] Selection state management
- [ ] Visual feedback (highlighting)
- [ ] Scene coordinate mapping

**Key Components:**

```python
# Selection system
ArrowSelectionManager
SelectionVisualFeedback
SceneCoordinateMapper

# Event handling
GraphEditorMouseHandler
ArrowClickDetector
```

**Acceptance Criteria:**

- [ ] Arrow selection accurate within 2px
- [ ] Visual feedback appears < 50ms
- [ ] Selection state synchronized globally
- [ ] Multiple arrow types supported

#### Week 4: Keyboard Input & Commands

**Deliverables:**

- [ ] WASD movement system
- [ ] Keyboard shortcut handler
- [ ] Command pattern for undo/redo
- [ ] Modifier key support

**Key Components:**

```python
# Keyboard handling
GraphEditorKeyHandler
ArrowMovementCommand
RotationOverrideCommand
PlacementRemovalCommand

# Command system
CommandManager
UndoRedoStack
```

**Acceptance Criteria:**

- [ ] All keyboard shortcuts working
- [ ] WASD movement smooth and accurate
- [ ] Undo/redo operations functional
- [ ] Modifier keys (Shift/Ctrl) supported

### Phase 3: Adjustment Panels (Weeks 5-6)

**Priority: High | Effort: 45 hours**

#### Week 5: Turn Adjustment System

**Deliverables:**

- [ ] Turn adjustment controls
- [ ] Real-time value display
- [ ] Increment/decrement functionality
- [ ] Validation and limits

**Key Components:**

```python
# Turn adjustment
TurnAdjustmentPanel
TurnValueDisplay
TurnIncrementControls
TurnValidationService

# Data binding
TurnDataBinding
RealTimeUpdateManager
```

**Acceptance Criteria:**

- [ ] Turn adjustments apply correctly
- [ ] Real-time updates working
- [ ] Value validation prevents invalid states
- [ ] UI responsive to rapid changes

#### Week 6: Orientation Picker & Panel Switching

**Deliverables:**

- [ ] Orientation picker component
- [ ] Start position mode
- [ ] Panel switching logic
- [ ] Context-sensitive display

**Key Components:**

```python
# Orientation system
OrientationPickerPanel
StartPositionModeManager
PanelSwitchingLogic
ContextSensitiveDisplay
```

**Acceptance Criteria:**

- [ ] Orientation picker functional
- [ ] Panel switching smooth
- [ ] Context detection accurate
- [ ] Start position mode working

### Phase 4: Animation & Polish (Weeks 7-8)

**Priority: Medium | Effort: 35 hours**

#### Week 7: Animation System

**Deliverables:**

- [ ] Smooth slide animations
- [ ] Height transition system
- [ ] Easing curve implementation
- [ ] Animation state management

**Key Components:**

```python
# Animation system
GraphEditorAnimator
SlideAnimationManager
HeightTransitionController
EasingCurveProvider
```

**Acceptance Criteria:**

- [ ] Animations smooth at 60fps
- [ ] Transition duration 300-400ms
- [ ] No animation conflicts
- [ ] Proper cleanup on completion

#### Week 8: Visual Polish & Performance

**Deliverables:**

- [ ] Modern styling implementation
- [ ] Performance optimization
- [ ] Memory leak prevention
- [ ] Accessibility features

**Key Components:**

```python
# Polish & optimization
ModernGraphEditorStyling
PerformanceOptimizer
MemoryManager
AccessibilityProvider
```

**Acceptance Criteria:**

- [ ] Visual design consistent with TKA
- [ ] Performance benchmarks met
- [ ] No memory leaks detected
- [ ] Accessibility standards compliant

## Technical Architecture

### Service Layer Design

```python
# Core service interfaces following TKA patterns
class IGraphEditorService(Protocol):
    def set_selected_beat(self, beat: BeatData, index: int) -> None
    def get_selected_beat(self) -> Optional[BeatData]
    def set_arrow_selection(self, arrow_id: str) -> None
    def apply_turn_adjustment(self, arrow_color: str, turn_value: float) -> bool
    def toggle_visibility(self) -> bool

class IGraphEditorStateService(Protocol):
    def save_state(self) -> None
    def restore_state(self) -> None
    def get_ui_state(self) -> GraphEditorUIState
```

### Component Hierarchy

```
ModernSequenceWorkbench
└── ModernGraphEditor
    ├── GraphEditorPictographContainer
    │   └── ModernPictographView
    ├── AdjustmentPanel
    │   ├── TurnAdjustmentPanel
    │   └── OrientationPickerPanel
    ├── ModernToggleTab
    └── GraphEditorAnimator
```

### Reactive Sizing Integration

- **Size Provider**: ModernGraphEditor implements sizing callbacks
- **Registration**: Child components register for size updates
- **Propagation**: Size changes propagate down the hierarchy
- **Consistency**: All components use unified sizing reference

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests**: >90% coverage for all services and components
- **Integration Tests**: Complete workflow testing
- **Performance Tests**: Response time and animation benchmarks
- **Accessibility Tests**: Screen reader and keyboard navigation

### Test Categories

```python
# Unit tests
test_graph_editor_service.py
test_arrow_selection_manager.py
test_turn_adjustment_service.py
test_animation_manager.py

# Integration tests
test_graph_editor_integration.py
test_workbench_integration.py
test_state_persistence.py

# Performance tests
test_response_times.py
test_animation_performance.py
test_memory_usage.py
```

## Risk Management

### High-Risk Items

1. **Arrow Selection Accuracy** - Mitigation: Comprehensive click detection tests
2. **Animation Performance** - Mitigation: Performance profiling and optimization
3. **State Synchronization** - Mitigation: Single source of truth via services

### Contingency Plans

- **Performance Issues**: Fallback to instant transitions
- **Complex Animations**: Simplified animation system
- **Integration Problems**: Phased rollout with feature flags

## Quality Assurance

### Code Quality Standards

- **Architecture**: Clean architecture compliance
- **Testing**: 90%+ coverage requirement
- **Performance**: Response time benchmarks
- **Documentation**: Comprehensive API documentation

### Review Process

- **Architecture Review**: Week 2 checkpoint
- **Feature Review**: End of each phase
- **Performance Review**: Week 7 checkpoint
- **Final Review**: Week 8 completion

## Delivery Timeline

### Milestones

- **Week 2**: Foundation architecture complete
- **Week 4**: Core interaction system working
- **Week 6**: Full feature set implemented
- **Week 8**: Production-ready release

### Dependencies

- **Option Picker Sizing**: Reactive sizing pattern established
- **Modern Architecture**: Clean architecture patterns in place
- **Service Layer**: Dependency injection container operational

## Success Metrics

### Functional Metrics

- [ ] 100% legacy feature parity achieved
- [ ] All user workflows supported
- [ ] No regression in functionality

### Performance Metrics

- [ ] Arrow selection response < 100ms
- [ ] Animation completion < 400ms
- [ ] Memory usage < 50MB additional
- [ ] 60fps animation smoothness

### Quality Metrics

- [ ] 90%+ test coverage
- [ ] Zero critical bugs
- [ ] Accessibility compliance
- [ ] Clean architecture validation

## Conclusion

This roadmap provides a structured approach to implementing the modern graph editor while maintaining the intuitive user experience of the legacy system. The phased approach ensures steady progress with regular validation points, while the focus on clean architecture and testing ensures long-term maintainability.

# Graph Editor Architecture Recommendations

## Executive Summary

Based on comprehensive analysis of the legacy graph editor codebase, this document provides specific architectural guidance for modernizing the system while preserving proven interaction patterns. The recommendations balance modernization goals with pragmatic functionality to ensure 100% user experience parity.

## Core Architectural Principles

### 1. Preserve What Works, Modernize What Doesn't

**PRESERVE (Direct Port)**:

- Global state management pattern (AppContext)
- QStackedWidget context switching
- Triple animation coordination
- Event handler separation
- Fixed central layout with flexible panels

**MODERNIZE (Clean Architecture)**:

- Dependency injection instead of direct coupling
- Service layer mediation instead of direct signals
- Interface segregation for testability
- Clean separation of concerns

## Specific Architecture Decisions

### 1. State Management Strategy

**Decision: Hybrid Global + Service State**

```python
# PRESERVE: Global state for arrow selection (proven pattern)
class ModernAppContext:
    """Direct port of legacy AppContext for arrow selection"""
    _selected_arrow: Optional[Arrow] = None

    @classmethod
    def set_selected_arrow(cls, arrow: Arrow) -> None:
        cls._selected_arrow = arrow
        # Emit signals through event system

    @classmethod
    def get_selected_arrow(cls) -> Optional[Arrow]:
        return cls._selected_arrow

# MODERNIZE: Service-managed state for other concerns
class IGraphEditorStateService(Protocol):
    def get_current_beat(self) -> Optional[BeatData]:
    def set_panel_mode(self, mode: PanelMode) -> None:
    def get_adjustment_values(self) -> dict:
```

**Rationale**:

- Arrow selection is performance-critical and the global pattern works
- Other state can benefit from service layer organization
- Maintains legacy behavior while improving testability

### 2. Component Communication Strategy

**Decision: Service-Mediated with Signal Passthrough**

```python
# PRESERVE: Critical signals for immediate feedback
class GraphEditorComponent(QFrame):
    arrow_selected = pyqtSignal(object)  # Direct signal for performance

    def handle_arrow_click(self, arrow):
        # Critical path: immediate state update
        ModernAppContext.set_selected_arrow(arrow)
        self.arrow_selected.emit(arrow)

        # Non-critical: service notification
        self._selection_service.notify_arrow_selected(arrow)

# MODERNIZE: Service coordination for complex operations
class IGraphEditorService(Protocol):
    def apply_turn_adjustment(self, color: str, value: float) -> bool:
    def update_pictograph_display(self, beat: BeatData) -> None:
    def coordinate_panel_updates(self) -> None:
```

**Rationale**:

- Performance-critical paths remain direct (arrow selection)
- Complex operations benefit from service coordination
- Maintains responsiveness while improving architecture

### 3. Animation System Architecture

**Decision: Preserve Legacy Animation Coordination**

```python
# PRESERVE: Exact legacy animation pattern
class GraphEditorAnimator(QObject):
    """Direct port of legacy animation system"""

    def animate_graph_editor(self, show: bool):
        # PRESERVE: Triple animation coordination
        # - Editor geometry animation
        # - Placeholder height animation
        # - Toggle tab position animation

        # PRESERVE: Exact timing and easing
        # - 300ms duration
        # - OutQuad easing curve
        # - Simultaneous execution
```

**Rationale**:

- Animation timing is critical for user experience
- Legacy coordination pattern works perfectly
- Users expect specific visual behavior
- No benefit to modernizing this pattern

### 4. Layout Management Strategy

**Decision: Enhanced Legacy Layout with Modern Sizing**

```python
# PRESERVE: Core layout structure
class GraphEditorLayoutManager:
    def setup_layout(self):
        main_layout = QHBoxLayout()

        # PRESERVE: Exact proportions and structure
        main_layout.addLayout(self.left_stack, stretch=1)
        main_layout.addWidget(self.pictograph_container, stretch=0)
        main_layout.addLayout(self.right_stack, stretch=1)

        # MODERNIZE: Integrate with reactive sizing
        self._sizing_service.register_component(self.pictograph_container)

# MODERNIZE: Size calculation service
class IReactiveSizingService(Protocol):
    def calculate_graph_editor_height(self, parent_height: int, parent_width: int) -> int:
    def register_size_listener(self, component: QWidget) -> None:
```

**Rationale**:

- Layout proportions are proven and stable
- Reactive sizing adds modern capability
- Maintains visual consistency with better responsiveness

### 5. Event Handling Architecture

**Decision: Separated Handlers with Service Backend**

```python
# PRESERVE: Handler separation (proven pattern)
class GraphEditorMouseEventHandler:
    """Direct port with service integration"""

    def handle_mouse_press(self, event: QMouseEvent):
        # PRESERVE: Exact selection logic
        scene_pos = self.view.mapToScene(event.pos())
        items = self.view.scene().items(scene_pos)
        arrow = next((item for item in items if isinstance(item, Arrow)), None)

        if arrow:
            # PRESERVE: Direct state update for performance
            ModernAppContext.set_selected_arrow(arrow)
            # MODERNIZE: Service notification for coordination
            self._selection_service.handle_arrow_selected(arrow)

class GraphEditorKeyEventHandler:
    """Enhanced legacy pattern with service support"""

    def handle_key_press(self, event: QKeyEvent):
        # PRESERVE: Exact key mapping and modifier handling
        # MODERNIZE: Route through service for complex operations
        self._hotkey_service.process_key_event(event)
```

**Rationale**:

- Event handler separation works well for testing
- Service backend enables better error handling
- Maintains immediate responsiveness

## Implementation Priority Framework

### Tier 1: Core Foundation (Must be perfect)

**Arrow Selection System**

```python
Priority: CRITICAL
Timeline: Week 3
Pattern: Direct port + modern services

Implementation:
1. Port ArrowSelectionManager exactly
2. Add service layer for coordination
3. Maintain < 50ms response time
4. Preserve global state pattern
```

**Animation System**

```python
Priority: CRITICAL
Timeline: Week 7
Pattern: Direct port

Implementation:
1. Port GraphEditorAnimator exactly
2. Maintain 300ms timing exactly
3. Preserve OutQuad easing
4. Keep triple coordination pattern
```

**Panel Context Switching**

```python
Priority: CRITICAL
Timeline: Week 5
Pattern: Direct port + enhanced validation

Implementation:
1. Port QStackedWidget pattern exactly
2. Add service layer for mode detection
3. Maintain instant switching
4. Enhance with better error handling
```

### Tier 2: Essential Experience (Must work correctly)

**Keyboard Hotkey System**

```python
Priority: HIGH
Timeline: Week 4
Pattern: Modern service with legacy behavior

Implementation:
1. Create IHotkeyService interface
2. Port legacy key mappings exactly
3. Maintain modifier key behavior
4. Add better conflict resolution
```

**Real-time Visual Updates**

```python
Priority: HIGH
Timeline: Week 6
Pattern: Modern data binding with legacy timing

Implementation:
1. Create reactive update system
2. Maintain < 60ms response time
3. Preserve immediate feedback
4. Add better state synchronization
```

### Tier 3: Quality Features (Should work well)

**Layout Management**

```python
Priority: MEDIUM
Timeline: Week 2
Pattern: Enhanced legacy with modern sizing

Implementation:
1. Port layout structure exactly
2. Integrate reactive sizing
3. Add better responsive behavior
4. Maintain visual proportions
```

**Toggle Tab System**

```python
Priority: MEDIUM
Timeline: Week 2
Pattern: Modern component with legacy positioning

Implementation:
1. Create modern toggle component
2. Port positioning logic exactly
3. Add improved styling system
4. Maintain dynamic repositioning
```

## Service Layer Design Principles

### Interface Segregation Strategy

```python
# FOCUSED: Single responsibility interfaces
class IArrowSelectionService(Protocol):
    def set_selected_arrow(self, arrow: Arrow) -> None:
    def get_selected_arrow(self) -> Optional[Arrow]:
    def clear_selection(self) -> None:

class ITurnAdjustmentService(Protocol):
    def apply_turn_value(self, color: str, value: float) -> bool:
    def get_current_turns(self, color: str) -> float:
    def validate_turn_value(self, value: float) -> bool:

class IAnimationService(Protocol):
    def slide_editor(self, show: bool) -> None:
    def is_animating(self) -> bool:
    def set_animation_duration(self, ms: int) -> None:
```

**Rationale**:

- Small interfaces easier to test and mock
- Clear responsibility boundaries
- Easier to implement incrementally

### Dependency Injection Architecture

```python
# CONTAINER: Central service registration
class GraphEditorContainer:
    def __init__(self):
        self._services = {}
        self._register_services()

    def _register_services(self):
        # Core services
        self.register(IArrowSelectionService, ArrowSelectionService)
        self.register(ITurnAdjustmentService, TurnAdjustmentService)
        self.register(IAnimationService, AnimationService)

        # Composite services
        self.register(IGraphEditorService, GraphEditorService)

# INJECTION: Constructor injection pattern
class ModernGraphEditor(QFrame):
    def __init__(
        self,
        selection_service: IArrowSelectionService,
        adjustment_service: ITurnAdjustmentService,
        animation_service: IAnimationService,
        parent: Optional[QWidget] = None
    ):
        super().__init__(parent)
        self._selection_service = selection_service
        self._adjustment_service = adjustment_service
        self._animation_service = animation_service
```

**Rationale**:

- Clear dependencies visible in constructor
- Easy to mock for testing
- Flexible service swapping
- Modern architectural pattern

## Testing Strategy Alignment

### Legacy Behavior Testing

```python
# PRESERVATION: Test exact legacy behavior
class TestLegacyBehaviorPreservation:
    def test_arrow_selection_timing(self):
        """Verify < 50ms response time like legacy"""

    def test_animation_duration(self):
        """Verify exact 300ms timing like legacy"""

    def test_keyboard_shortcuts(self):
        """Verify exact WASD behavior like legacy"""

    def test_panel_switching(self):
        """Verify instant switching like legacy"""

# MODERNIZATION: Test architectural improvements
class TestArchitecturalImprovements:
    def test_service_isolation(self):
        """Verify services work independently"""

    def test_dependency_injection(self):
        """Verify proper service resolution"""

    def test_interface_compliance(self):
        """Verify all services implement interfaces"""
```

### Performance Testing Framework

```python
# BENCHMARKS: Validate performance requirements
@pytest.mark.performance
class TestPerformanceRequirements:
    def test_arrow_selection_response_time(self):
        # Must be < 50ms like legacy

    def test_keyboard_input_latency(self):
        # Must be < 16ms for 60fps

    def test_animation_smoothness(self):
        # Must maintain 60fps during animations

    def test_memory_usage_stability(self):
        # Must not leak during extended use
```

## Migration Strategy

### Phase 1: Foundation (Weeks 1-2)

- Implement service interfaces
- Create dependency injection container
- Port core layout management
- Setup basic component structure

### Phase 2: Critical Systems (Weeks 3-4)

- Port arrow selection system exactly
- Implement keyboard handling with legacy behavior
- Create animation system with exact timing
- Ensure performance requirements met

### Phase 3: Complete Features (Weeks 5-6)

- Port adjustment panel systems
- Implement context switching exactly
- Add real-time update systems
- Complete visual feedback systems

### Phase 4: Polish & Validation (Weeks 7-8)

- Fine-tune animations and timing
- Complete integration testing
- Validate user experience parity
- Performance optimization

### Phase 5: Integration (Weeks 9-10)

- Complete workbench integration
- User acceptance testing
- Performance validation
- Documentation completion

## Success Metrics

### Architectural Quality

- [ ] 90%+ test coverage across all services
- [ ] All components follow dependency injection
- [ ] Clean separation between UI and business logic
- [ ] All interfaces properly defined and implemented

### Legacy Parity

- [ ] Arrow selection < 50ms response time
- [ ] Animation exactly 300ms with OutQuad easing
- [ ] Keyboard shortcuts work identically
- [ ] Panel switching instant like legacy
- [ ] Visual appearance matches legacy

### Modern Standards

- [ ] Clean architecture compliance
- [ ] Proper error handling and logging
- [ ] Memory usage stability
- [ ] Performance monitoring capability
- [ ] Accessibility compliance

## Conclusion

This architectural approach balances modernization with pragmatic preservation of proven patterns. By identifying which legacy patterns work well and should be preserved versus which should be modernized, we can achieve both goals: clean, maintainable architecture and identical user experience.

The key insight is that not everything needs to be modernized—some legacy patterns are already optimal for their purpose. The architecture preserves these while modernizing areas that benefit from clean architecture principles.
