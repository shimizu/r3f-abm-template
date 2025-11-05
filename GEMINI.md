# GEMINI Project Summary: R3F + AgentScript (ABM) Template

## 1. Project Overview

This project is a template for building and visualizing agent-based models (ABM) in the browser using **React Three Fiber (R3F)** and **AgentScript**. It includes a real-time crowd evacuation simulation as a demo implementation. The primary goal is to provide a foundational structure for developing custom ABM simulations in a 3D environment.

## 2. Technology Stack

- **Frontend:**
  - **React 18**: For building the user interface.
  - **React Three Fiber (R3F)**: A React renderer for Three.js, used for 3D scenes.
  - **@react-three/drei**: A collection of useful helpers for R3F.
  - **Leva**: A GUI panel for real-time control of simulation parameters.
- **Simulation Logic:**
  - **AgentScript**: A framework for creating agent-based models in JavaScript.
- **Development & Build:**
  - **Vite**: A modern frontend build tool providing a fast development server and optimized builds.
  - **ESLint**: For static code analysis and enforcing code quality.

## 3. Project Structure

```
/
├─── index.html           # HTML entry point
├─── vite.config.js       # Vite configuration
├─── package.json         # Project dependencies and scripts
├─── src/
│    ├─── main.jsx        # Main application entry point (renders App)
│    ├─── App.jsx         # Main React component, sets up the R3F Canvas
│    ├─── Scene.jsx       # Core 3D scene, manages agents and environment rendering
│    ├─── agentScript.js  # Defines the agent-based simulation model and logic
│    └─── layout.js       # Contains the grid data for the simulation environment
```

## 4. Key Scripts

- `npm run dev`: Starts the Vite development server for local development.
- `npm run build`: Creates a production-ready build of the application.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Serves the production build locally for previewing.

## 5. How to Run

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
This will open the simulation in your web browser. You can use the Leva GUI to control the simulation parameters.
