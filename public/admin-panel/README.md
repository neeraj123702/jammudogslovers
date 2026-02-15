# Admin Panel Project

This project is an admin panel for managing dog data using Firebase for authentication and data management. It includes a responsive design with a clean premium dark theme.

## Project Structure

```
admin-panel
├── public
│   ├── admin.html          # HTML structure for the admin panel
│   ├── styles
│   │   └── admin.css       # CSS styles for the admin panel
│   └── scripts
│       └── admin.js        # JavaScript logic for the admin panel
├── src
│   ├── main.ts             # Entry point for the TypeScript application
│   ├── auth
│   │   ├── firebase.ts     # Firebase initialization
│   │   └── auth.ts         # User authentication functions
│   ├── components
│   │   ├── Login.ts        # Login form component
│   │   ├── Dashboard.ts     # Dashboard layout component
│   │   ├── AddDogForm.ts    # Form for adding new dogs
│   │   └── ManageDogs.ts     # Component for managing dogs
│   ├── services
│   │   └── dogs.ts         # Functions for CRUD operations on dog data
│   └── types
│       └── index.ts        # TypeScript interfaces and types
├── package.json             # npm configuration file
├── tsconfig.json            # TypeScript configuration file
├── firebase.json            # Firebase Hosting configuration
├── .firebaserc              # Firebase project settings
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd admin-panel
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure Firebase:**
   - Create a Firebase project and add your web app.
   - Update the Firebase configuration in `src/auth/firebase.ts`.

4. **Run the application:**
   ```
   npm start
   ```

5. **Access the admin panel:**
   Open `public/admin.html` in your web browser.

## Usage Guidelines

- Use the login form to authenticate users.
- Once logged in, you can access the dashboard to manage dog data.
- Use the "Add Dog" form to add new dogs to the database.
- Manage existing dogs in the "Manage Dogs" section, where you can edit or delete entries.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.