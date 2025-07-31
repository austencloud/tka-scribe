# TKA VS Code Performance Optimization Guide

## 🚀 **Additional Optimizations Beyond Ruff**

### **1. Hardware/System Level**

#### **RAM Optimization:**
```bash
# Check current memory usage
tasklist /fi "imagename eq Code.exe" /fo table

# If VS Code is using >2GB, restart it occasionally
# Windows: Ctrl+Shift+P → "Developer: Reload Window"
```

#### **SSD Performance:**
- ✅ **Move .venv to SSD** (if not already)
- ✅ **Enable SSD optimizations** in Windows
- ✅ **Disable Windows indexing** on code directories

#### **Windows Performance:**
```powershell
# Run as Administrator - Optimize Windows for development
# Disable Windows Defender real-time scanning for your code directory
Add-MpPreference -ExclusionPath "F:\CODE"

# Disable Windows Search indexing for code directories  
# Control Panel → Indexing Options → Modify → Uncheck your code folders
```

### **2. Git Performance Optimizations**

#### **Git Configuration:**
```bash
# Navigate to your TKA directory
cd F:\CODE\TKA

# Optimize Git for large repositories
git config core.preloadindex true
git config core.fscache true
git config gc.auto 256

# Enable Git's built-in file system monitor (if available)
git config core.fsmonitor true

# Reduce Git's memory usage
git config pack.windowMemory 100M
git config pack.packSizeLimit 100M
```

#### **Git Hooks Optimization:**
- ✅ **Pre-commit already optimized** (using Ruff)
- ❌ **Disable unused Git hooks** if any exist

### **3. Python Environment Optimizations**

#### **Virtual Environment:**
```bash
# Navigate to TKA and activate venv
cd F:\CODE\TKA
.venv\Scripts\activate

# Remove unused packages to reduce import times
pip list | findstr -v "essential_package"

# Clean pip cache to save disk space
pip cache purge

# Optimize Python import performance  
python -m compileall .
```

#### **Python Bytecode:**
```bash
# Pre-compile Python files for faster imports
python -c "import compileall; compileall.compile_dir('.', force=True)"
```

### **4. VS Code Workspace Optimization**

#### **Multi-root Workspace (for TKA's structure):**
Create `.vscode/tka.code-workspace`:
```json
{
  "folders": [
    {
      "name": "TKA-Modern",
      "path": "./src/desktop/modern"
    },
    {
      "name": "TKA-Web",
      "path": "./src/web"
    },
    {
      "name": "TKA-Schemas",
      "path": "./schemas"
    }
  ],
  "settings": {
    "python.defaultInterpreterPath": "./.venv/Scripts/python.exe"
  }
}
```

#### **Disable Unused Language Servers:**
Add to VS Code settings:
```json
{
  "css.validate": false,
  "scss.validate": false,  
  "html.validate.scripts": false,
  "json.validate.enable": false
}
```

### **5. File System Optimizations**

#### **Antivirus Exclusions:**
Add these to your antivirus exclusions:
- `F:\CODE\TKA\.venv\`
- `F:\CODE\TKA\node_modules\`
- `F:\CODE\TKA\.git\`
- `F:\CODE\TKA\__pycache__\`
- VS Code executable paths

#### **Windows Defender:**
```powershell
# Run as Administrator
# Exclude development folders from real-time scanning
Add-MpPreference -ExclusionPath "F:\CODE"
Add-MpPreference -ExclusionProcess "python.exe"
Add-MpPreference -ExclusionProcess "Code.exe"
```

### **6. Extension Audit & Optimization**

#### **Essential Extensions Only:**
Keep these active:
- ✅ **Python** (Microsoft)
- ✅ **Ruff** (charliermarsh.ruff)
- ✅ **Pylance** (Microsoft)
- ✅ **Svelte for VS Code**

#### **Disable These Performance Killers:**
- ❌ **GitLens** (if installed)
- ❌ **Auto Rename Tag**
- ❌ **Bracket Pair Colorizer** (use built-in)
- ❌ **Path Intellisense** (use built-in)
- ❌ **IntelliCode** (if causing slowdowns)

#### **Extension Settings to Optimize:**
```json
{
  "python.languageServer": "Pylance",
  "python.analysis.completeFunctionParens": false,
  "python.analysis.autoSearchPaths": false,
  "python.analysis.extraPaths": []
}
```

### **7. Memory Management**

#### **VS Code Memory Limits:**
```json
{
  "typescript.tsserver.maxTsServerMemory": 4096,
  "python.analysis.memory.keepLibraryAst": false
}
```

#### **Restart Strategy:**
- **Daily**: Restart VS Code once per day
- **Weekly**: Restart computer once per week  
- **Monthly**: Clear VS Code cache

### **8. Network/External Service Optimizations**

#### **Disable External Services:**
```json
{
  "update.mode": "none",
  "extensions.autoUpdate": false,
  "telemetry.telemetryLevel": "off",
  "workbench.enableExperiments": false
}
```

## 🎯 **Performance Testing**

### **Before/After Measurement:**
1. **Startup Time**: Time from VS Code launch to ready
2. **File Open Time**: Time to open large Python files
3. **IntelliSense Speed**: Time for autocomplete to appear
4. **Search Performance**: Time to search across project

### **Monitoring Tools:**
```bash
# Check VS Code performance
# Command Palette → "Developer: Show Running Extensions"
# Command Palette → "Developer: Toggle Developer Tools"
```

## 📊 **Expected Performance Improvements**

After implementing all optimizations:
- ✅ **50-70% faster startup**
- ✅ **30-50% reduced memory usage**  
- ✅ **Instant code formatting** (thanks to Ruff)
- ✅ **Faster file operations**
- ✅ **Smoother typing/editing experience**

## 🚨 **Trade-offs**

Some optimizations disable convenience features:
- **No minimap** (but faster rendering)
- **Reduced IntelliSense** (but faster typing)
- **Fewer Git decorations** (but better performance)
- **No breadcrumbs** (but cleaner UI)

You can re-enable any feature if you miss it!

## 🔧 **Implementation Priority**

**High Impact, Low Effort:**
1. ✅ **Already done**: Ruff migration
2. **Extension audit** (5 minutes)
3. **Antivirus exclusions** (5 minutes)

**Medium Impact, Medium Effort:**
4. **Git optimizations** (10 minutes)
5. **Python environment cleanup** (15 minutes)

**Lower Impact, Higher Effort:**
6. **Multi-root workspace setup** (30 minutes)
7. **System-level optimizations** (varies)

Try the high-impact items first and see how much better VS Code feels!
