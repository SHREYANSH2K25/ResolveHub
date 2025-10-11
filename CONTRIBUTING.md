# Contributing to ResolveHub

Thank you for considering contributing to ResolveHub! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use the issue templates** when available
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Feature Requests

1. **Check existing feature requests** to avoid duplicates
2. **Describe the problem** your feature would solve
3. **Provide implementation details** if you have ideas
4. **Consider the scope** - smaller, focused features are more likely to be accepted

### Pull Requests

1. **Fork the repository** and create a feature branch
2. **Follow the coding standards** outlined below
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Keep commits focused** and write clear commit messages

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/ResolveHub.git
cd ResolveHub

# Install backend dependencies
cd BACKEND
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cp BACKEND/.env.example BACKEND/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your credentials
```

### Running the Development Environment
```bash
# Terminal 1 - Backend
cd BACKEND
npm run server

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📝 Coding Standards

### JavaScript/React Guidelines

1. **Use ES6+ features** (arrow functions, destructuring, etc.)
2. **Follow ESLint configuration** (run `npm run lint`)
3. **Use meaningful variable and function names**
4. **Keep functions small and focused** (single responsibility)
5. **Add JSDoc comments** for complex functions

### Component Structure
```jsx
// Good component structure
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Helper functions
  const handleSomething = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.number
};

export default ComponentName;
```

### API Guidelines

1. **Use RESTful conventions** for endpoints
2. **Include proper error handling** with meaningful messages
3. **Validate input data** on both client and server
4. **Use appropriate HTTP status codes**
5. **Add request/response logging** for debugging

### Database Guidelines

1. **Use Mongoose schemas** with validation
2. **Index frequently queried fields**
3. **Use transactions** for multi-document operations
4. **Implement proper error handling**

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd BACKEND
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

### Writing Tests

1. **Write unit tests** for utility functions
2. **Write integration tests** for API endpoints
3. **Write component tests** for React components
4. **Mock external dependencies** appropriately

### Test Structure
```javascript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });

  afterEach(() => {
    // Cleanup
  });
});
```

## 📋 Commit Guidelines

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples
```
feat(auth): add Google OAuth integration

fix(api): resolve CORS issue with frontend requests

docs(readme): update installation instructions

refactor(components): simplify complaint form validation
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Improve test coverage
- [ ] Add mobile-responsive components
- [ ] Enhance accessibility (a11y)
- [ ] Performance optimizations
- [ ] Documentation improvements

### Medium Priority
- [ ] Additional OAuth providers
- [ ] Enhanced reporting features
- [ ] Multi-language support (i18n)
- [ ] Advanced filtering options
- [ ] Notification preferences

### Low Priority
- [ ] Dark mode improvements
- [ ] Animation enhancements
- [ ] Additional chart types
- [ ] Export formats
- [ ] API rate limiting

## 🚀 Release Process

### Version Numbers
We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes (backward compatible)

### Release Checklist
1. Update version numbers
2. Update CHANGELOG.md
3. Run full test suite
4. Update documentation
5. Create release notes
6. Tag the release
7. Deploy to staging
8. Deploy to production

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussion
- **Email**: shreyanshjain354@gmail.com for sensitive issues

### Code of Conduct
Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (when available)

Thank you for contributing to ResolveHub! 🏛️✨