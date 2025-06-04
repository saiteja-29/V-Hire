# VHire
**GitHub link: https://github.com/anuksha11/VHire/tree/iteration-2** <br><br>
Many companies face challenges in conducting interviews, as their tech teams are often engaged in the interview process voluntarily, which can lead to vague and inconsistent interviews and requires too much of their bandwidth for this. To address this, we propose developing software that outsources the first or technical round of interviews. This solution will benefit both candidates and companies by offering a seamless interview experience for applicants while making it easier for companies to shortlist candidates.Additionally, it will significantly reduce the effort required from engineering teams during the technical round of the hiring process.

## Technologies Used

- **React.js**: For the frontend framework
- **Zegocloud**: A real-time audio and video communication service used for video conferencing.
- **Node.js**: For backend development.
- **Tailwind CSS**: Styling framework
- **Socket.io**: For bidirectional communication between clients and servers.
- **FireBase** : Database

## Features:

1. **User Authentication** – Secure login and registration for candidates, companies, and admins.
2. **Company Registration** – Companies can register, post job openings, and view a filtered list of candidates.
3. **Candidate Management** – Companies can shortlist and access candidate profiles and resumes.
4. **Collaborative Code Editor and Compiler** – In-browser coding rounds powered by a One Compiler and Code Mirror API .
5. **Chatbot** - Chatbot to help assist the interviewers.
6. **Video Conferencing Engine** – Seamless video interviews using the Zego Cloud API.
7. **Report Generation** by the Interviewer

## Modules
The project is divided into two main parts:

### 📦 1. `backend/`

This directory contains the backend logic for the platform. It manages api calls.

---

### 💻 2. `vhire-interview-platform/`

This directory contains the frontend codebase built using **React + TypeScript**. It includes components and pages for candidates, companies, and interviewers.
#### 📁 `src/services`:
Handles user authentication and profile management using Firebase Authentication and Firestore. It includes methods for user registration, login, profile updates, and logout.
#### 📁 `src/context`:
Provides a centralized way to manage user login/logout state across the app using Context API, including saving the user to localStorage so they stay logged in across page reloads.

#### 📁 `src/components/`

##### 🔹 `candidate/`
Components specific to candidates:
- View the dashboard of the candidate
- Join interview rooms


##### 🔹 `company/`
- Schedule interviews
- View and manage interview reports
- Manage rooms and candidate assignments

##### 🔹 `interviewer/`
Components used by interviewers:
- Conduct live interviews
- Submit reports with scoring and verdicts
- Access candidate details

#####  Top-Level Components

- **`Header.tsx`**  
  Navigation bar component shared across all pages.

- **`Home.tsx`**  
  Landing page with an overview.

- **`Login.tsx`**  
  User login component. Supports all user types (candidate, company, interviewer).

- **`Profile.tsx`**  
  User profile page. Allows updating user-specific information.

- **`ProtectedRoute.tsx`**  
  Wrapper component to restrict access to routes for unauthenticated users.

- **`Register.tsx`**  
  Registration page for all roles. Sends form data to backend for account creation.

- **`Report.tsx`**  
  Interview report form for interviewers to score and give verdicts on candidates.

- **`RoomPage.tsx`**  
  Real-time collaborative interview room with:
  - Code editor (CodeMirror)
  - Socket.io integration for real-time code sharing
  - AI Chatbot assistant
  - Video Conferencing Engine

## How to use the apis:
### Gemini API:
1. Open the link "https://aistudio.google.com/u/1/apikey" and signup with your gmail.
2. Click on Create API Key
3. Copy the API Key
   
### One Compiler API:
1. Open "https://rapidapi.com" in your browser and signup with your gmail.
2. In the "Search APIs" button type One Compiler APIs and select the api.
3. Copy the "X-RapidAPI-Key"

### How to Get Razorpay API Keys:

1. Go to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Sign in or create a free account.
3. Navigate to **Settings > API Keys**.
4. Click **"Generate Key"** (use **Test Mode** for development).
5. Copy the following:
   - **Key ID** → Use as `RAZORPAY_KEY_ID`
   - **Key Secret** → Use as `RAZORPAY_KEY_SECRET`

   
## Steps to run the application
###  Firebase Admin SDK Service Key (`firebaseServiceKey.json`)

To securely interact with Firebase services like Firestore on the server, you need a service key file.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Navigate to **Project Settings** (gear icon).
4. Click on the **Service accounts** tab.
5. Click **"Generate new private key"**.
6. It will download a file like: `firebase-adminsdk-xxxxx.json`.

> Rename this file to `firebaseServiceKey.json` and place it securely in your **backend project directory**.  
> Do **not** commit this file to version control (add it to `.gitignore`).

### Steps to run the backend:
1. Clone the github repo:
   ```bash
   git clone https://github.com/anuksha11/VHire.git
   ```
2. Change Directory:
   ```bash
   cd VHire
   ```
3. Change the branch:
   ```bash
   git checkout iteration-2
   ```
4. To change the directory:
   ```bash
   cd vhire-it-1 
   ```
5. To change the directory:
   ```bash
   cd backend
   ```   
6. Install the dependencies:
   ```bash
   npm install (to install all node modules)
   ```
7. Create a .env file in the backend directory.
8. Paste the following in the .env file(paste your gemini, razor pay and one compiler api keys along with this)
   ```
   GOOGLE_GENAI_API_KEY=
   RAPIDAPI_KEY=
   RAPIDAPI_HOST=onecompiler-apis.p.rapidapi.com
   ONE_COMPILER_API_URL=https://onecompiler-apis.p.rapidapi.com/api/v1/run
   `RAZORPAY_KEY_ID`
   `RAZORPAY_KEY_SECRET`
   ```
9. Paste the following in the .env file(in vhire-interview-platform for frontend )
   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSyDvCpgPVqkK-7iQQHflEtyFEHrzvRXqGlA
   REACT_APP_FIREBASE_AUTH_DOMAIN=vhire-auth-backend.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=vhire-auth-backend
   REACT_APP_FIREBASE_STORAGE_BUCKET=vhire-auth-backend.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1003604212360
   REACT_APP_FIREBASE_APP_ID=1:1003604212360:web:fc5220d005f44ad2b47d3d
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-HTW50NEQKH

   REACT_APP_ZEGO_APP_ID=1803852747
   REACT_APP_ZEGO_SERVER_SECRET=a039bd3defe5b6b9aa0d23d3fcd43438
   ```
10. Run the command:
   ```bash
   npm start (to run the backend)
   ```

### Open new Terminal(For Running Frontend):
1. 
   ```bash
   cd vhire-it-1 (change directotry)
   ```
2. ```bash
   cd vhire-interview-platform
   ```
3. ```bash
   npm install (to install all node modules)
   ```
4. ```bash
   npm start (to run the frontend)
   ```

