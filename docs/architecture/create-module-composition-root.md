# CreateModule - Composition Root Architecture

## Overview

CreateModule serves as the **Composition Root** for the Create module. It orchestrates dependency injection, service initialization, context provision, reactive effect coordination, event handling delegation, and layout management.

## Architectural Pattern: Composition Root

This component intentionally has more responsibilities than typical presentational components because it serves as the application shell for the Create module. This is appropriate and follows clean architecture principles for composition roots.

## Responsibilities

### 1. Service Orchestration
- Resolve all required services via DI container
- Initialize state objects (CreateModuleState, constructTabState)
- Set up service lifecycle (initialization, cleanup)

### 2. Context Provision
- Provide CreateModuleContext to all child components
- Expose reactive state, services, and layout info via context
- Legacy support: panelState via Svelte context

### 3. Effect Coordination
- Delegate all reactive effects to CreateModuleEffectCoordinator
- Manage effect lifecycle (setup, cleanup)
- Coordinate cross-cutting concerns (layout, navigation, PWA, etc.)

### 4. Event Handling
- Delegate all business logic to handler services
- Manage component-level state (error, animation, UI flags)
- Wire up parent callbacks (onTabAccessibilityChange, onCurrentWordChange)

### 5. Layout Management
- Track side-by-side vs stacked layout state
- Coordinate with ResponsiveLayoutService
- Provide layout context to child components

### 6. Session State Management
- Track creation method selection via CreationMethodPersistenceService
- Sync with workspace empty state for welcome screen visibility

## Child Components

- **CreationWelcomeScreen**: Initial welcome/prompt screen
- **CreationWorkspaceArea**: Main pictograph workspace
- **CreationToolPanelSlot**: Tool panel (construct/generate/practice tabs)
- **ButtonPanel**: Action buttons (play, share, clear, etc.)
- **Coordinators**: Modal/panel coordinators (Edit, Share, Animation, etc.)

## Services Used

- **ICreateModuleInitializationService**: One-time initialization
- **ICreateModuleHandlers**: Event handling delegation
- **ICreationMethodPersistenceService**: Session storage for creation method
- **ICreateModuleEffectCoordinator**: Reactive effect orchestration
- **IResponsiveLayoutService**: Layout detection and management
- Plus all services in CreateModuleServices interface

## Design Rationale

This component is intentionally larger than typical components because:
1. It's a composition root (application shell)
2. It needs to orchestrate DI, context, and lifecycle
3. All business logic is extracted to services
4. All UI logic is extracted to child components
5. Further extraction would scatter initialization flow

## What NOT to Do

Do not try to make this component smaller by:
- Splitting initialization into multiple components
- Moving DI resolution to child components
- Scattering context setup across multiple files

The composition root pattern requires centralized orchestration.

## Domain

Create module - Composition Root
