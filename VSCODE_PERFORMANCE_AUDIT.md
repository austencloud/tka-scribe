# VS Code Extension Performance Audit
# Run this in VS Code Command Palette: "Developer: Show Running Extensions"

## HIGH-IMPACT OPTIMIZATIONS:

### 1. DISABLE HEAVY EXTENSIONS (if you have them):
- ❌ **Pylint** extension (you're using Ruff now)
- ❌ **Black Formatter** extension (Ruff handles this)  
- ❌ **isort** extension (Ruff handles this)
- ❌ **autoDocstring** (heavy IntelliSense)
- ❌ **Python Docstring Generator** (heavy)
- ❌ **GitLens** (can be very slow on large repos)
- ❌ **Bracket Pair Colorizer** (use built-in version)

### 2. KEEP THESE ESSENTIAL EXTENSIONS:
- ✅ **Python** (Microsoft) - Essential
- ✅ **Ruff** (charliermarsh.ruff) - New fast linter
- ✅ **Pylance** (Microsoft) - Fast type checking
- ✅ **Svelte for VS Code** - For your web components
- ✅ **Git** extensions (built-in) - Essential

### 3. EXTENSIONS TO CONFIGURE BETTER:
- **Python**: Disable unused features
- **IntelliCode**: Reduce suggestions
- **Auto-import**: Disable if slow
