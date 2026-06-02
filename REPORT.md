# PulseWise Health Prediction System

## Title Page

**Project:** PulseWise Health Prediction System  
**Course:** CSCI390 Web Programming  
**Phase:** Project Phase 2  
**Semester:** Spring 2025-2026  
**Team Members:** Add names here

## Abstract

PulseWise Clinic is a responsive ReactJS frontend application for a health care portal. It includes login, registration, appointment booking, payment simulation, patient reviews, contacts, about us information, and an educational health risk prediction system. The prediction system asks users to enter age, BMI, systolic blood pressure, glucose, cholesterol, activity level, smoking status, and family history. It then calculates a risk level, explains the main contributing factors, and presents basic prevention recommendations.

## System Design

The application is organized as a single-page React app with internal page state used for navigation. It includes nine main pages:

- Home: introduces the system and directs users to the prediction form.
- Predict: collects health indicators and calculates the risk score.
- Appointments: lets patients book a doctor visit.
- Payments: simulates a clinic payment and stores payment history.
- Reviews: lets patients leave ratings and comments.
- Contacts: provides phone, email, and address information.
- About Us: describes the system purpose and disclaimer.
- Login: authenticates an existing user.
- Register: creates a new patient account.

The prediction logic is implemented in `calculateRisk()`. Each health indicator adds weighted points to a total score. The score is capped at 100 and categorized as Low, Moderate, or High risk. The UI displays the score, risk level, contributing factors, and recommended actions.

## Technologies Used

- ReactJS for frontend components and state management
- Vite for local development and production builds
- JavaScript for prediction logic
- CSS3 for responsive layout and visual design
- LocalStorage for saved accounts, appointments, reviews, and payments
- Git and GitHub for version control and submission

## Key Code Snippets

```jsx
const result = useMemo(() => calculateRisk(form), [form]);
```

This recalculates the prediction whenever the user changes form input.

```jsx
const level = normalized >= 65 ? "High" : normalized >= 35 ? "Moderate" : "Low";
```

This converts the numeric score into a readable risk category.

```jsx
setForm((current) => ({
  ...current,
  [field]: numericFields.includes(field) ? Number(value) : value,
}));
```

This updates the prediction form while preserving all other user inputs.

## UI Screenshots

Add screenshots of:

- Home page
- Predictor page with sample low-risk result
- Predictor page with sample high-risk result
- Mobile navigation view

## Repository Link

Add GitHub repository link here after uploading the project.

## Group Contribution Statement

Add each member's work here, for example:

- Student 1: React components and navigation
- Student 2: Prediction logic and form validation
- Student 3: CSS styling and responsiveness
- Student 4: README, report, and deployment

## Disclaimer

PulseWise is an educational screening project. It is not a diagnosis tool and does not replace professional medical advice.
