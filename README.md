# Conservation Connector

Camp Monarch's Conservation Connector - An interactive map application for visualizing and managing conservation areas worldwide.

## Features

- **Interactive World Map**: Explore conservation areas from world view down to street level using OpenStreetMap
- **Heat Map Visualization**: Visual representation of gaps between conservation areas
  - Red lines indicate large gaps between protected areas
  - Blue lines indicate short distances between areas
- **Add Conservation Areas**: Interactively add new conservation areas by clicking on the map
  - Set custom radius for each area (5-200 km)
  - Name your conservation areas
  - Preview areas before submission
- **Layer Management**: Toggle visibility of conservation areas and heat map
- **Submit & Save**: Submit new areas which are saved as downloadable JSON files
- **Real-time Statistics**: View total areas, connections, and gaps
- **User Feedback**: Submit feedback, bug reports, feature requests, and suggestions directly from the app

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building

Build for production:

```bash
npm run build
```

## Deployment

This application is configured for deployment to Azure Static Web Apps. For detailed deployment instructions, including Azure resource setup and configuration, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Configuring User Feedback

The feedback mechanism requires a GitHub Personal Access Token to submit feedback to the repository. To enable this feature:

1. **Create a GitHub Personal Access Token:**
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "ConservationConnector Feedback")
   - Select the **"repo"** scope
   - Generate the token and copy it

2. **Add the token to your environment:**
   - **For local development:** Create a `.env` file in the project root with:
     ```
     VITE_GITHUB_TOKEN=your_github_token_here
     ```
   - **For Azure Static Web Apps:** Add it in the Configuration settings as `VITE_GITHUB_TOKEN`

⚠️ **Important:** Never commit your `.env` file or expose your GitHub token in code.

Without the token configured, the feedback form will still be accessible but will show a warning and disable submission.

## Usage

1. **View Existing Areas**: The map loads with pre-existing conservation areas displayed as blue circles
2. **Toggle Layers**: Use checkboxes in the toolbox to show/hide conservation areas and heat map
3. **Add New Area**:
   - Enter an optional name for the area
   - Adjust the radius slider (5-200 km)
   - Click "Click Map to Add Area" button
   - Click anywhere on the map to place the new area
   - The area appears as a green circle
4. **Submit Areas**: Click "Submit All New Areas" to download a JSON file with your additions
5. **Send Feedback**: Click the 💬 button in the bottom-right corner to provide feedback
6. **Zoom**: Use +/- buttons or mouse wheel to zoom from world to street level

## Data Structure

Conservation areas are stored in `public/data/conservation-areas.json` with the following format:

```json
[
  {
    "id": "unique-id",
    "name": "Area Name",
    "lat": 44.4280,
    "lng": -110.5885,
    "radius": 50000,
    "description": "Area description"
  }
]
```

## Technologies

- React 19
- Vite
- Leaflet & React-Leaflet
- OpenStreetMap

## License

MIT
