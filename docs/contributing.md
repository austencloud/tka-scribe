# Contributing to TKA Monorepo

Thank you for your interest in contributing to The Kinetic Constructor! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git
- VSCode (recommended)

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/austencloud/the-kinetic-constructor.git
cd the-kinetic-constructor

# Set up development environment
python scripts/setup.py

# Verify setup
python scripts/dev.py test
```

## 📋 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow the coding standards below
- Write tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run all tests
python scripts/dev.py test

# Test specific components
cd apps/desktop && python -m pytest modern/tests/
cd apps/web && npm test
```

### 4. Commit and Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Use the PR template
- Link related issues
- Request review from maintainers

## 🎯 Coding Standards

### Python (Desktop App)
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions and classes
- Maximum line length: 88 characters

```python
def calculate_motion_path(
    start_position: Position, 
    end_position: Position,
    motion_type: MotionType
) -> List[Point]:
    """Calculate the motion path between two positions.
    
    Args:
        start_position: Starting position
        end_position: Ending position
        motion_type: Type of motion to calculate
        
    Returns:
        List of points representing the motion path
    """
    # Implementation here
    pass
```

### TypeScript/JavaScript (Web Apps)
- Use TypeScript for type safety
- Follow Prettier formatting
- Use ESLint for code quality
- Prefer functional components

```typescript
interface SequenceProps {
  sequence: SharedSequenceType;
  onUpdate: (sequence: SharedSequenceType) => void;
}

export function SequenceEditor({ sequence, onUpdate }: SequenceProps) {
  // Component implementation
}
```

### Shared Packages
- Keep types synchronized between Python and TypeScript
- Use consistent naming conventions
- Document all public APIs

## 🧪 Testing Guidelines

### Python Tests
- Use pytest framework
- Place tests in `apps/desktop/modern/tests/`
- Follow the existing test organization
- Aim for >80% code coverage

```python
def test_motion_calculation():
    """Test motion path calculation."""
    start = Position(0, 0)
    end = Position(100, 100)
    
    path = calculate_motion_path(start, end, MotionType.PRO)
    
    assert len(path) > 0
    assert path[0] == start
    assert path[-1] == end
```

### JavaScript/TypeScript Tests
- Use Vitest or Jest
- Place tests alongside components
- Test user interactions and edge cases

```typescript
import { render, fireEvent } from '@testing-library/svelte';
import SequenceEditor from './SequenceEditor.svelte';

test('should update sequence on user input', () => {
  const { getByRole } = render(SequenceEditor, { 
    props: { sequence: mockSequence } 
  });
  
  const input = getByRole('textbox');
  fireEvent.input(input, { target: { value: 'new name' } });
  
  // Assert expectations
});
```

## 📁 Project Structure

### Adding New Features

#### Desktop App Features
1. Create feature in `apps/desktop/modern/src/`
2. Add tests in `apps/desktop/modern/tests/`
3. Update API endpoints if needed
4. Document in appropriate docs

#### Web App Features
1. Create components in `apps/web/src/`
2. Add routes if needed
3. Write component tests
4. Update shared types if needed

#### Shared Functionality
1. Add to appropriate package in `packages/`
2. Update both Python and TypeScript versions
3. Version bump the package
4. Update dependent applications

## 🔄 Release Process

### Version Numbering
We use Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Release Steps
1. Update version numbers
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Create GitHub release
6. Deploy to production

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Reproduce the bug
- Test on latest version

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10]
- Python version: [e.g. 3.9.7]
- Node.js version: [e.g. 18.17.0]
- App version: [e.g. 1.2.3]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## 📞 Getting Help

- **Discord**: [TKA Community](https://discord.gg/tka)
- **GitHub Discussions**: For questions and ideas
- **Issues**: For bugs and feature requests
- **Email**: team@tka.dev

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

Thank you for contributing to TKA! 🎉
