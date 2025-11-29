# MoodLens Design Guidelines

## Design Approach: Starry Night Theme
**Reference-Based Approach** inspired by cosmic/space interfaces (Stellarium, NASA Visualization tools) combined with modern wellness apps (Calm, Headspace).

**Core Aesthetic**: Create an immersive, calming starry night atmosphere that promotes tranquility while housing sophisticated AI monitoring tools. The interface should feel like a peaceful cosmic observatory rather than a clinical monitoring system.

## Typography
- **Primary Font**: 'Space Grotesk' (Google Fonts) - modern geometric with cosmic feel
- **Secondary Font**: 'Inter' (Google Fonts) - for body text and data
- **Hierarchy**:
  - Hero/Section Headers: text-4xl to text-5xl, font-bold
  - Emotion Labels: text-2xl, font-semibold
  - Card Titles: text-xl, font-medium
  - Body Text: text-base, font-normal
  - Data/Metrics: text-sm to text-lg, tabular-nums

## Layout System
**Spacing Units**: Use Tailwind units of 3, 4, 6, 8, 12 for consistent cosmic breathing room
- Section padding: py-12 to py-16
- Card padding: p-6 to p-8
- Element gaps: gap-4 to gap-8
- Container: max-w-7xl with px-6

## Component Library

### 1. Main Dashboard Layout
**Split-Screen Design**:
- Left Panel (40%): Live webcam feed with real-time emotion overlay
- Right Panel (60%): Emotion analytics, AI recommendations, and wellness tools
- Both panels feature subtle animated starfield backgrounds

### 2. Webcam Emotion Monitor
- Large circular webcam viewport (400px diameter) centered in left panel
- Floating emotion detection overlay showing current detected emotion
- Confidence meter as orbital ring around webcam feed
- Real-time facial landmark visualization (subtle constellation-like dots)
- Status indicator: "Monitoring Active" with pulsing star icon

### 3. Emotion Analytics Dashboard
**Current State Card**:
- Large emotion icon with detected emotion name
- Confidence percentage display
- Mini timeline showing last 5 minutes of emotion changes
- Timestamp of last detection

**Emotion Distribution Chart**:
- Radial/polar chart showing 6 emotions (happiness, sadness, anger, neutral, fear, surprise)
- Percentage breakdown with visual bars/arcs
- Time range selector (Last hour, Today, This week)

### 4. AI Wellness Recommendations Panel
**Contextual Suggestion Cards**:
- Prominent recommendation based on detected emotional pattern
- 2-3 action cards in horizontal scroll/grid
- Each card includes: Icon, Title, Brief description (2 lines max), "Start" button
- Examples: "Breathing Exercise", "Guided Meditation", "Take a Break", "Positive Affirmation"

### 5. Interactive Breathing Exercise Widget
**Expandable/Modal Component**:
- Large animated circle for breathing rhythm (inhale/exhale)
- Timer and cycle counter
- Visual cue: expanding/contracting orb synced with breathing pace
- Instruction text: "Breathe In" / "Hold" / "Breathe Out"
- Calming star particles floating during exercise
- Exit/minimize button

### 6. Mood History Timeline
**Visual Timeline Section**:
- Horizontal scrollable timeline with emotion markers
- Each entry shows: timestamp, dominant emotion, duration
- Graph visualization option: line chart of emotional variance
- Date range filter and export option
- Summary stats: "Most common mood", "Peak stress time", "Calm periods"

### 7. Navigation & Header
**Minimal Top Navigation**:
- Logo/App name (left) with moon/star icon
- Session timer showing monitoring duration
- Quick actions: Settings, History, About
- Notification bell for wellness reminders

### 8. Wellness Quick Actions
**Floating Action Menu** (bottom-right):
- Primary FAB with 3-4 quick wellness tools
- Emergency calm-down button
- Manual mood log entry
- Pause monitoring option

### 9. Settings Panel
**Slide-in Configuration**:
- Webcam permissions and camera selection
- Detection sensitivity slider
- Notification preferences
- Privacy controls (data retention, sharing)
- Theme customization toggles

## Images & Visual Elements

### Background Imagery
1. **Primary Background**: Animated starfield with twinkling stars (canvas/WebGL element, not static image)
2. **Moon Element**: Subtle moon illustration in top-right corner as ambient visual
3. **Constellation Overlays**: Faint constellation line patterns as decorative elements between sections

### Iconography
- Use **Heroicons** for all UI icons via CDN
- Custom emotion icons: Use simplified face illustrations (happy, sad, angry, neutral, fearful, surprised) - placeholder for custom SVG set
- Wellness activity icons from Heroicons (heart, sparkles, lightning-bolt, etc.)

### No Hero Image
This is a web application dashboard, not a marketing page - no traditional hero section needed. The live webcam feed serves as the focal point.

## Animations (Minimal & Purposeful)
- Starfield: Subtle twinkling and slow parallax on scroll
- Emotion transitions: Smooth fade between detected emotions
- Breathing widget: Rhythmic scaling animation only
- Card reveals: Simple fade-in on load
- NO scroll-triggered animations or excessive motion

## Accessibility
- High contrast text overlays on starfield backgrounds
- ARIA labels for all emotion indicators and interactive elements
- Keyboard navigation for all controls
- Screen reader announcements for emotion changes
- Focus indicators with cosmic glow effect
- Reduced motion mode available in settings