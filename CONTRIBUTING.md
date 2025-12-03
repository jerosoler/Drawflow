# Contributing to Drawflow

Thank you for your interest in contributing to Drawflow! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Development Workflow](#development-workflow)
  - [Building the Library](#building-the-library)
  - [Running the Development Server](#running-the-development-server)
  - [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Code Guidelines](#code-guidelines)
- [License](#license)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v12 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

### Setting Up the Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Drawflow.git
   cd Drawflow
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Verify the setup** by running the build:
   ```bash
   npm run build
   ```

## Development Workflow

### Building the Library

To build the library for production:

```bash
npm run build
```

This command:
- Runs webpack to bundle the JavaScript into `dist/drawflow.min.js`
- Runs gulp to minify CSS into `dist/drawflow.min.css`
- Generates `dist/drawflow.style.js` for LitElement usage

### Running the Development Server

To start a development server with hot reloading:

```bash
npm run dev
```

This will open a browser window at `http://localhost:8080` where you can test your changes in real-time.

### Project Structure

```
Drawflow/
├── src/
│   ├── drawflow.js          # Main entry point
│   ├── drawflow.css         # Core styles
│   ├── modules/             # Feature modules
│   │   ├── ConnectionManager.js
│   │   ├── MobileHandler.js
│   │   ├── ModuleManager.js
│   │   ├── NodeManager.js
│   │   ├── RerouteManager.js
│   │   └── ZoomHandler.js
│   └── utils/               # Utility functions
│       ├── curvature.js
│       ├── EventEmitter.js
│       └── uuid.js
├── dist/                    # Built files (generated)
├── docs/                    # Documentation and examples
├── gulpfile.js              # Gulp tasks for CSS processing
├── webpack.config.js        # Webpack configuration
└── package.json
```

## How to Contribute

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/jerosoler/Drawflow/issues/new) with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser and OS information
- Code samples or screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please [open an issue](https://github.com/jerosoler/Drawflow/issues/new) with:

- A clear description of the feature
- The use case or problem it solves
- Any implementation ideas you may have

### Submitting Pull Requests

1. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the [Code Guidelines](#code-guidelines)

3. **Test your changes** by running the development server and verifying functionality

4. **Build the project** to ensure there are no errors:
   ```bash
   npm run build
   ```

5. **Commit your changes** with a clear, descriptive commit message:
   ```bash
   git commit -m "Add: description of your changes"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** on GitHub with:
   - A clear title and description
   - Reference to any related issues
   - Screenshots or GIFs for visual changes

## Code Guidelines

- Write clean, readable, and well-documented code
- Follow the existing code style in the project
- Keep changes focused and atomic
- Avoid introducing new dependencies unless absolutely necessary
- Ensure your changes work across major browsers
- Test on both desktop and mobile devices when applicable
- Update documentation if your changes affect the public API

## License

By contributing to Drawflow, you agree that your contributions will be licensed under the [MIT License](LICENSE).
