@echo off
echo === RUNNING COMPLETE VALIDATION SUITE ===
echo.
echo NOTE: This script has been updated to use the new python_setup.bat
echo.

echo [1/6] Basic Structure Validation...
..\python_setup.bat run basic_validation.py
if %errorlevel% neq 0 (
    echo ❌ Basic validation failed!
    exit /b 1
)
echo.

echo [2/6] Comprehensive Service Validation...
..\python_setup.bat run validate_start_position_services.py
if %errorlevel% neq 0 (
    echo ❌ Service validation failed!
    exit /b 1
)
echo.

echo [3/6] Integration Validation...
..\python_setup.bat run validate_integration_nogui.py
if %errorlevel% neq 0 (
    echo ❌ Integration validation failed!
    exit /b 1
)
echo.

echo [4/6] Service Functionality Tests...
..\python_setup.bat run test_service_functionality.py
if %errorlevel% neq 0 (
    echo ❌ Service functionality tests failed!
    exit /b 1
)
echo.

echo [5/6] Component Service Usage Verification...
..\python_setup.bat run verify_component_service_usage_signatures.py
if %errorlevel% neq 0 (
    echo ❌ Component service usage verification failed!
    exit /b 1
)
echo.

echo [6/6] Backward Compatibility Verification...
..\python_setup.bat run verify_backward_compatibility.py
if %errorlevel% neq 0 (
    echo ❌ Backward compatibility verification failed!
    exit /b 1
)
echo.

echo === ALL VALIDATIONS COMPLETE ===
echo ✅ ALL TESTS PASSED - START POSITION SERVICE REFACTORING COMPLETE!
