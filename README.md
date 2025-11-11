# News Map

[![Deploy to GitHub Pages](https://github.com/Inasjackw321/news-map/actions/workflows/deploy.yml/badge.svg)](https://github.com/Inasjackw321/news-map/actions/workflows/deploy.yml)

An interactive real-time news mapping application where users can log in with Google and place markers for news events around the world, similar to LiveUAMap.

**Live Demo**: [https://Inasjackw321.github.io/news-map](https://Inasjackw321.github.io/news-map)

## Features

- **Google Authentication**: Secure login with Google OAuth
- **Interactive Map**: Leaflet-based world map for placing news markers
- **Real-time Updates**: Auto-mode for live marker updates using Firebase Firestore
- **News Categories**: Organize events by category (Conflict, Politics, Disaster, Economy, Social, Technology, Environment)
- **Rich Markers**: Add title, description, source, and location to each news event
- **Responsive Design**: Works on desktop and mobile devices
- **Recent Marker Highlighting**: Recently added markers (< 24 hours) are animated

## Screenshots

### Main Map View
The application shows a world map with news markers categorized by type.

### Marker Details
Click on any marker to see detailed information about the news event.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Authentication**: Firebase Authentication (Google Provider)
- **Database**: Firebase Firestore
- **Map**: Leaflet + React-Leaflet
- **Styling**: Custom CSS with gradients and animations

## Prerequisites

- Node.js 16+ and npm
- A Firebase account
- A Google Cloud project with OAuth configured

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd news-map
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Authentication** with Google provider:
   - Go to Authentication > Sign-in method
   - Enable Google
4. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database (start in test mode for development)
   - **Important**: Set up security rules (see below)
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and create a Web app
   - Copy the Firebase configuration

### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Set Up Firestore Security Rules

In the Firebase Console, go to Firestore Database > Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read markers
    match /markers/{markerId} {
      allow read: if true;

      // Only authenticated users can create markers
      allow create: if request.auth != null
                    && request.resource.data.authorId == request.auth.uid
                    && request.resource.data.title is string
                    && request.resource.data.description is string
                    && request.resource.data.category is string
                    && request.resource.data.position.lat is number
                    && request.resource.data.position.lng is number;

      // Only the author can update/delete their markers
      allow update, delete: if request.auth != null
                            && resource.data.authorId == request.auth.uid;
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 7. Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Log In**: Click "Sign in with Google" in the header
2. **Place a Marker**: Click anywhere on the map to open the marker form
3. **Fill Details**: Enter title, category, description, and optional source
4. **Submit**: Click "Create Marker" to add it to the map
5. **Toggle Auto-mode**: Use the Auto/Manual button to enable/disable real-time updates
6. **View Markers**: Click on any marker to see its details

## Project Structure

```
news-map/
├── src/
│   ├── components/
│   │   ├── AuthPanel.jsx      # Google login/logout UI
│   │   ├── Map.jsx             # Main map component with markers
│   │   └── MarkerForm.jsx      # Form for creating news markers
│   ├── styles/
│   │   ├── index.css           # Global styles
│   │   ├── App.css             # App layout styles
│   │   ├── AuthPanel.css       # Authentication UI styles
│   │   ├── Map.css             # Map and marker styles
│   │   └── MarkerForm.css      # Form styles
│   ├── firebase.js             # Firebase configuration
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # Entry point
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
└── .env                        # Environment variables (create from .env.example)
```

## Firebase Firestore Data Structure

### Markers Collection

Each marker document has the following structure:

```javascript
{
  title: string,              // Brief title (max 100 chars)
  description: string,        // Detailed description (max 500 chars)
  category: string,           // One of: conflict, politics, disaster, economy, social, technology, environment, other
  source: string,             // Optional source URL or reference
  position: {
    lat: number,              // Latitude
    lng: number               // Longitude
  },
  authorId: string,           // User UID from Firebase Auth
  authorName: string,         // Display name
  authorEmail: string,        // User email
  createdAt: timestamp        // Server timestamp
}
```

## Features Explanation

### Auto-mode
When enabled, the map automatically listens for new markers added by any user in real-time using Firebase's `onSnapshot` listener. The button pulses with a green glow when active.

### Marker Categories
- ⚔️ Conflict
- 🏛️ Politics
- 🌪️ Disaster
- 💰 Economy
- 👥 Social
- 💻 Technology
- 🌍 Environment
- 📍 Other

### Recent Markers
Markers created within the last 24 hours appear larger and with a bouncing animation to draw attention.

## Deployment

### Deploy to GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup GitHub Pages

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
4. The site will automatically deploy when you push to the `main` branch

#### First-time Setup

1. Make sure all your changes are committed
2. Merge your feature branch to `main`:
```bash
git checkout main
git merge claude/google-login-map-011CV1UHN6mcGsyxKAnadeSk
git push origin main
```

3. GitHub Actions will automatically build and deploy
4. Your site will be available at: `https://Inasjackw321.github.io/news-map`

#### Important Notes

- The app is configured with base path `/news-map/` for GitHub Pages
- Make sure to add your Firebase config to GitHub Secrets if needed (for production)
- The `.nojekyll` file ensures proper deployment
- Deployment typically takes 2-3 minutes

#### Viewing Deployment Status

- Go to the "Actions" tab in your GitHub repository
- Click on the latest workflow run to see deployment progress
- Once complete, visit your GitHub Pages URL

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```

3. Build and deploy:
```bash
npm run build
firebase deploy
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Drag the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Troubleshooting

### Firebase Authentication Errors
- Make sure Google sign-in is enabled in Firebase Console
- Check that your domain is authorized in Firebase Console > Authentication > Settings > Authorized domains

### Markers Not Appearing
- Verify Firestore rules allow read access
- Check browser console for errors
- Ensure Firebase configuration in `.env` is correct

### Map Not Loading
- Check internet connection (Leaflet tiles require internet)
- Clear browser cache
- Check for console errors

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- [Leaflet](https://leafletjs.com/) for the excellent mapping library
- [React-Leaflet](https://react-leaflet.js.org/) for React integration
- [Firebase](https://firebase.google.com/) for authentication and database
- [LiveUAMap](https://liveuamap.com/) for inspiration

## Future Enhancements

- [ ] Filter markers by category
- [ ] Search functionality
- [ ] User profiles with marker history
- [ ] Marker verification/voting system
- [ ] Image uploads for news events
- [ ] Comment threads on markers
- [ ] Export data as GeoJSON
- [ ] Mobile app (React Native)
- [ ] News feed sidebar
- [ ] Heatmap visualization
- [ ] Time-based filtering

## Support

For issues and questions, please open an issue on GitHub.
