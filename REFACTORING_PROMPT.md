# 🚀 Production API Refactoring Prompt - Expert-Level Decomposition

## 🎯 **OBJECTIVE**

Refactor the monolithic `production_api.py` (984 lines) into a clean, maintainable FastAPI application following modern enterprise patterns and single responsibility principles.

## 📊 **CURRENT PROBLEM**

The `production_api.py` file violates multiple SOLID principles by handling 10+ distinct responsibilities in a single module:

1. **API Route Definitions** (17+ endpoints)
2. **Service Initialization & DI** (Global service management)
3. **Data Transformation** (Domain ↔ API converters)
4. **Exception Handling** (Custom error handlers)
5. **Application Lifecycle** (Startup/shutdown events)
6. **Performance Monitoring** (Metrics collection)
7. **Health Checks & Status** (System diagnostics)
8. **CORS Configuration** (Cross-origin middleware)
9. **Command Processing** (Undo/redo operations)
10. **Event Bus Integration** (Event statistics)

## 🏗️ **TARGET ARCHITECTURE**

Create a modular FastAPI application structure:

```
infrastructure/api/
├── main.py                    # FastAPI app creation & configuration
├── dependencies.py            # Dependency injection setup
├── middleware.py              # CORS, exception handling, logging
├── lifecycle.py               # Startup/shutdown events
├── converters/
│   ├── __init__.py
│   ├── motion_converters.py   # MotionData ↔ MotionAPI
│   ├── beat_converters.py     # BeatData ↔ BeatAPI
│   └── sequence_converters.py # SequenceData ↔ SequenceAPI
├── routers/
│   ├── __init__.py
│   ├── health.py              # Health checks & system status
│   ├── sequences.py           # Sequence CRUD operations
│   ├── beats.py               # Beat operations
│   ├── commands.py            # Undo/redo operations
│   ├── arrows.py              # Arrow positioning & management
│   └── monitoring.py          # Performance metrics & events
└── exceptions.py              # Custom exception classes
```

## 🔧 **SPECIFIC REFACTORING TASKS**

### **Task 1: Create Main Application Factory**

**File**: `main.py`

- Create `create_app()` factory function
- Configure FastAPI with proper settings
- Register all routers with appropriate prefixes
- Add middleware registration
- Keep file under 50 lines

### **Task 2: Extract Dependency Injection**

**File**: `dependencies.py`

- Move all `get_*_service()` functions
- Add proper dependency lifecycle management
- Implement dependency caching where appropriate
- Add type hints for all dependencies

### **Task 3: Modularize Data Converters**

**Files**: `converters/*.py`

- **motion_converters.py**: `domain_to_api_motion()`, `api_to_domain_motion()`
- **beat_converters.py**: `domain_to_api_beat()`, `api_to_domain_beat()`
- **sequence_converters.py**: `domain_to_api_sequence()`, `api_to_domain_sequence()`
- Add comprehensive error handling for conversion failures
- Include validation for all conversions

### **Task 4: Create Focused Routers**

Split endpoints by domain:

**File**: `routers/health.py`

- `GET /health` - Basic health check
- `GET /status` - Detailed system status
- Keep lightweight and fast

**File**: `routers/sequences.py`

- `GET /sequences/current` - Get current sequence
- `POST /sequences` - Create sequence
- `GET /sequences/{sequence_id}` - Get specific sequence
- `PUT /sequences/{sequence_id}` - Update sequence
- `DELETE /sequences/{sequence_id}` - Delete sequence

**File**: `routers/beats.py`

- `POST /sequences/{sequence_id}/beats` - Add beat
- `PUT /sequences/{sequence_id}/beats/{beat_id}` - Update beat
- `DELETE /sequences/{sequence_id}/beats/{beat_id}` - Remove beat

**File**: `routers/commands.py`

- `POST /commands/undo` - Undo last action
- `POST /commands/redo` - Redo last action
- `GET /commands/{command_id}/status` - Get command status

**File**: `routers/arrows.py`

- `POST /arrows/calculate-position` - Calculate arrow position
- `POST /arrows/check-mirror` - Check arrow mirror

**File**: `routers/monitoring.py`

- `GET /metrics/performance` - Performance metrics
- `GET /events/stats` - Event bus statistics

### **Task 5: Extract Middleware & Exception Handling**

**File**: `middleware.py`

- Move CORS configuration
- Extract `http_exception_handler()` and `general_exception_handler()`
- Add request logging middleware
- Add performance timing middleware

**File**: `exceptions.py`

- Define custom exception classes
- Add proper error response models
- Include error codes and descriptions

### **Task 6: Application Lifecycle Management**

**File**: `lifecycle.py`

- Move `startup_event()` and `shutdown_event()`
- Add proper service initialization order
- Include graceful shutdown handling
- Add logging for lifecycle events

## 📋 **IMPLEMENTATION REQUIREMENTS**

### **Code Quality Standards**

- **Maximum file size**: 200 lines per file
- **Single Responsibility**: Each file handles ONE concern
- **Type Safety**: Full type hints throughout
- **Error Handling**: Comprehensive exception handling
- **Logging**: Structured logging for debugging
- **Documentation**: Clear docstrings for all public functions

### **Dependency Management**

- **NO global variables** - Use FastAPI dependency injection
- **Proper lifecycle**: Services initialized once at startup
- **Resource cleanup**: Proper shutdown handling
- **Testability**: All dependencies easily mockable

### **Performance Considerations**

- **Lazy loading**: Services loaded only when needed
- **Caching**: Appropriate dependency caching
- **Monitoring**: Performance metrics preserved
- **Resource efficiency**: No memory leaks

### **Backward Compatibility**

- **API contract**: ALL existing endpoints preserved
- **Response format**: Identical response structures
- **Error handling**: Same error response format
- **Functionality**: Zero regression in features

## 🧪 **VALIDATION CRITERIA**

### **Structural Validation**

- [ ] No file exceeds 200 lines
- [ ] Each router handles single domain
- [ ] All converters are pure functions
- [ ] Dependencies properly injected
- [ ] No circular imports

### **Functional Validation**

- [ ] All 17+ endpoints working identically
- [ ] Error handling preserved
- [ ] Performance metrics functional
- [ ] Health checks operational
- [ ] Command processing intact

### **Quality Validation**

- [ ] 100% type coverage
- [ ] Comprehensive error handling
- [ ] Proper logging throughout
- [ ] Clean separation of concerns
- [ ] Testable architecture

## 🚦 **IMPLEMENTATION STRATEGY**

### **Phase 1: Foundation (30 minutes)**

1. Create new modular structure
2. Extract and organize imports
3. Set up base classes and utilities

### **Phase 2: Core Decomposition (45 minutes)**

1. Extract data converters first (safest)
2. Create dependency injection module
3. Split routers by domain

### **Phase 3: Integration (30 minutes)**

1. Create main app factory
2. Wire all components together
3. Add middleware and lifecycle

### **Phase 4: Validation (15 minutes)**

1. Test all endpoints
2. Verify error handling
3. Check performance metrics
4. Validate logging

## 💡 **SUCCESS METRICS**

**Maintainability**: 5x easier to add new endpoints
**Testability**: Each component independently testable
**Readability**: Clear, focused modules under 200 lines
**Performance**: Zero performance regression
**Reliability**: Comprehensive error handling throughout

## 🎯 **EXPECTED OUTCOME**

Transform a monolithic 984-line file into:

- **1 main app factory** (< 50 lines)
- **6 focused routers** (< 150 lines each)
- **3 data converters** (< 100 lines each)
- **4 utility modules** (< 100 lines each)

**Total**: ~1000 lines across 14 focused, maintainable files.

Each file will have a single, clear responsibility and be easily testable, maintainable, and extensible.

---

## 🚀 **GET STARTED**

**Priority Order**:

1. Start with converters (safest, pure functions)
2. Extract dependencies (clear boundaries)
3. Split routers (domain-driven)
4. Add infrastructure (middleware, lifecycle)
5. Create main factory (wire everything together)

**Remember**: Preserve ALL existing functionality while dramatically improving code organization and maintainability!
