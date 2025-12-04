/**
 * TKA Studio Knowledge Base
 *
 * Comprehensive context for AI-powered feedback analysis.
 * This gives any AI model the domain knowledge needed to understand
 * user feedback even when descriptions are vague or use informal terminology.
 */

/**
 * Core domain concepts that define what TKA Studio is
 */
export const DOMAIN_OVERVIEW = `
## What is TKA Studio?

TKA Studio (The Kinetic Alphabet Studio) is a web application for creating, learning, and practicing a visual dance notation system called "The Kinetic Alphabet" (TKA).

**Core Concept**: TKA is a system for choreographing STATIC prop manipulations (not spinning props like poi). It uses a grid-based visual language to represent prop movements, positions, and rotations through space.

**Key Principle**: Every movement is broken down into discrete "beats" shown as pictographs - visual diagrams that encode position, motion type, rotation, and orientation.
`;

/**
 * Domain terminology glossary
 */
export const DOMAIN_GLOSSARY = `
## Core Terminology

### Sequences & Beats
- **Sequence**: A complete choreographed routine made of multiple beats in order
- **Beat**: A single frame/moment showing prop position and motion (like a frame of animation)
- **Start Position**: The initial prop configuration before a sequence begins (not counted as beat 1)

### Pictographs
- **Pictograph**: A visual diagram representing the prop state at one moment - shows grid position, motion arrows, prop orientation
- **Letter**: Each pictograph maps to a letter (A-Z, plus Greek letters like Σ, Δ, Φ, θ, Ω, α, β, Γ)
- **Glyph**: Visual symbol representing pictograph data

### Props (Physical Objects)
- **Staff**: Long pole held with both hands (bilateral)
- **Fan**: Held in one hand (unilateral)
- **Hoop**: Circular prop (mini or big)
- **Club**: Single-hand prop
- **Buugeng**: S-shaped bilateral prop
- **Triad**: Three-pronged prop

**Important**: TKA is for STATIC props only - not spinning props like poi.

### Motion Types
- **PRO**: Rotation in anatomically forward direction (like an arm rolling outward)
- **ANTI**: Rotation opposite to PRO (like an arm rolling inward)
- **FLOAT**: Prop maintains its orientation while moving (appears to "float")
- **DASH**: Linear movement without rotation
- **STATIC**: No movement - prop held in position

### Orientations (How the prop points)
- **IN**: Prop points toward grid center (radial inward)
- **OUT**: Prop points away from grid center (radial outward)
- **CLOCK**: Prop points in clockwise direction (non-radial)
- **COUNTER**: Prop points counter-clockwise (non-radial)

### Grid System
- **Grid**: The spatial reference system showing positions
- **DIAMOND mode**: Cardinal directions (North, South, East, West)
- **BOX mode**: Diagonal directions (NE, SE, SW, NW)
- **Grid Position**: Named positions (alpha1-8, beta1-8, gamma1-16)

### Motion Colors
- **BLUE**: First/left hand motion (displayed in blue)
- **RED**: Second/right hand motion (displayed in red)
- **Dual-hand**: When both blue and red motions happen simultaneously

### VTG System (Advanced)
- **VTG**: "Vulcan Tech Gospel" - categorizes timing/direction of dual-hand movements
- **Split**: Hands move at different times
- **Together (Tog)**: Hands move simultaneously
- **Same**: Both hands move same direction
- **Opposite (Opp)**: Hands move opposite directions

### Reversals
- **Reversal**: When a motion is inverted/mirrored
- **Blue Reversal**: Blue motion is reversed
- **Red Reversal**: Red motion is reversed
`;

/**
 * Application modules and features
 */
export const APP_MODULES = `
## Application Modules

### Dashboard (Home)
The landing page with colored module cards. Shows:
- Profile card with user stats (sequences, favorites)
- Today's Challenge widget
- Quick access to all modules
- "Open Library" button

### Create Module
Build custom sequences from scratch.
**Tabs:**
- **Assemble**: Select starting position and hand paths using interactive grid
- **Construct**: Add motions and turns using option picker with pictograph grids
- **Generate**: AI-powered sequence creation with customizable parameters

**Key UI Elements:**
- Option Picker - grid of selectable pictograph options
- Start Position Picker - select where sequence begins
- Pictograph Grid - visual display of options
- Transform tools - mirror, rotate, swap colors, reverse

### Discover Module
Browse and search community sequences.
**Tabs:**
- **Gallery**: Grid view of sequences with filtering
- **Collections**: Organized sequence groups
- **Creators**: Browse creator profiles

**Key UI Elements:**
- Sequence cards with thumbnails
- Filter panel (by letter, level, length, favorites)
- Sort controls (name, date, popularity)
- Sequence detail panel (side drawer or bottom sheet)
- Favorite button on cards

### Learn Module
Educational content and quizzes.
**Tabs:**
- **Concepts**: Progressive learning path with visual demonstrations
- **Play**: Interactive quizzes (letter-to-pictograph, motion identification, etc.)
- **Codex**: Reference browser for all letters and pictographs

**Key UI Elements:**
- Concept cards with mastery indicators
- Quiz workspace with answer buttons
- Progress tracker and grades

### Compose Module (Also called Animate)
Arrange sequences into multi-cell grid compositions.
**Tabs:**
- **Arrange**: Grid-based composition builder
- **Browse**: Gallery of saved compositions

**Key UI Elements:**
- Composition Canvas - grid of cells for placing sequences
- Cell Config Sheet - configure individual cells
- Tunnel mode - overlay multiple sequences in one cell
- Templates drawer - quick composition templates

### Train Module
Practice sequences with feedback.
**Tabs:**
- **Practice**: Multiple training modes (Step, Timed, Adaptive)
- **Challenges**: Daily and skill challenges
- **Progress**: Stats, personal bests, session history

**Key UI Elements:**
- Camera preview panel
- Beat overlay grid
- Animation canvas
- Control bar (play, pause, speed, loop)
- Practice mode selector

### Settings Module
User preferences and configuration.
**Sections:**
- **Profile**: Display name, avatar, email verification
- **Props**: Default prop type and appearance
- **Appearance**: Theme, background, colors
- **Display**: Visibility preferences, grid overlay settings
- **Advanced**: Accessibility, haptics, developer options

### Feedback Module
Submit bugs and feature requests.
**Tabs:**
- **Submit**: Form for new feedback
- **Manage** (Admin): Kanban board for tracking feedback status

### Library Module
Personal sequence collection.
**Sections:**
- Sequences, Collections, Acts (recordings), Favorites

### Admin Module (Admin only)
System administration.
**Sections:**
- Users, Analytics, Challenges, Feature Flags
`;

/**
 * Common UI elements and controls
 */
export const UI_ELEMENTS = `
## Common UI Elements

### Canvas & Display
- **Animation Canvas**: Main area showing animated playback
- **Composition Canvas**: Grid for arranging multiple sequences
- **Pictograph Display**: Static pictograph rendering
- **Beat Grid**: Sequence of beat thumbnails

### Playback Controls
- **Play/Pause Button**: Start/stop animation
- **Stop Button**: Reset to beginning
- **Loop Button**: Toggle continuous playback
- **Speed Control**: Adjust playback speed (BPM)
- **Export Button**: Generate video

### Trail Effects (Animation visual effects)
- **Trail Mode**: OFF, BASIC, or ADVANCED
- **Fade Duration**: How long trails persist
- **Line Width**: Thickness of trail lines
- **Opacity**: Trail transparency
- **Motion Visibility Buttons**: Show/hide blue or red motion trails

### Navigation
- **Bottom Navigation**: Mobile nav bar with module icons
- **Desktop Sidebar**: Side navigation on larger screens
- **Module Switcher**: Quick switch between modules
- **Tab Bar**: Switch between tabs within a module

### Sheets & Panels
- **Bottom Sheet**: Slides up from bottom (mobile)
- **Side Panel**: Opens from side (desktop)
- **Drawer**: Pull-out panel with drag handle
- **Modal/Dialog**: Centered overlay

### Cards & Lists
- **Sequence Card**: Thumbnail with title, creator, stats
- **Module Card**: Colored card on dashboard
- **Concept Card**: Learning concept with progress
- **Challenge Card**: Challenge info with rewards

### Form Controls
- **Slider**: Horizontal value adjustment
- **Stepper**: Plus/minus buttons for numbers
- **Toggle Switch**: On/off control
- **Dropdown/Select**: Option selection
`;

/**
 * Common user terminology mappings
 * Maps informal/vague terms to technical concepts
 */
export const USER_TERMINOLOGY = `
## User Terminology Mappings

When users describe issues, they often use informal language. Here's how to interpret common phrases:

### Prop & Motion Terms
- "the blue one" / "blue hand" / "left motion" → Blue motion (first/left hand)
- "the red one" / "red hand" / "right motion" → Red motion (second/right hand)
- "the stick" / "pole" → Staff prop
- "spinning" / "rotating" → PRO or ANTI motion type
- "floating" / "gliding" → FLOAT motion type
- "stuck" / "frozen" → Could be STATIC motion, or a bug
- "arrows" → Motion direction indicators in pictographs
- "hand thing" → Likely referring to prop or motion visualization

### Grid & Position Terms
- "the grid" / "diamond" / "box" → Grid mode (DIAMOND or BOX)
- "center" / "middle" → Grid center point
- "corner" / "edge" → Grid outer positions
- "position" / "spot" → Grid position (alpha/beta/gamma)

### UI Terms
- "the screen" / "main area" → Canvas or main display
- "the buttons at the bottom" → Bottom navigation or control bar
- "the side menu" → Desktop sidebar or settings panel
- "the card" / "box" / "tile" → Could be sequence card, module card, or cell
- "popup" / "thing that slides up" → Sheet/drawer/modal
- "the picker" / "selector" → Option picker or dropdown
- "thumbnail" / "preview" → Sequence card image or pictograph

### Animation Terms
- "playing" / "animating" → Playback mode
- "trails" / "lines following" → Trail effect system
- "speed" / "tempo" → BPM control
- "loop" / "repeat" → Loop playback mode
- "export" / "save video" → Video generation

### Module Terms
- "home" / "main page" → Dashboard
- "browse" / "search" / "find sequences" → Discover module
- "make" / "build" / "create" → Create module
- "practice" / "train" → Train module
- "learn" / "study" / "quiz" → Learn module
- "arrange" / "compose" / "grid layout" → Compose module
- "settings" / "preferences" → Settings module

### Action Terms
- "save" / "keep" → Save sequence or favorite
- "delete" / "remove" → Delete action
- "share" → Share functionality
- "favorite" / "heart" / "star" → Favorite button
- "edit" / "change" / "modify" → Edit mode
- "back" / "go back" → Navigation back

### Problem Descriptions
- "doesn't work" → Generic issue - need clarification on what specifically
- "broken" → Could be visual bug, functionality, or crash
- "slow" / "laggy" → Performance issue
- "wrong" / "incorrect" → Data or display error
- "can't find" / "missing" → Navigation or visibility issue
- "won't load" / "spinning forever" → Loading/fetch error
- "crashes" / "freezes" → App stability issue
`;

/**
 * Known pain points and common issues
 */
export const KNOWN_ISSUES = `
## Common Issue Patterns

### Animation & Playback
- Trail effects not rendering correctly
- Speed/BPM not affecting playback
- Loop mode not working as expected
- Export video quality or format issues

### Grid & Positioning
- Pictographs displaying in wrong position
- Grid mode switching issues
- Arrow placement incorrect

### Navigation
- Getting lost between modules
- Back button not working as expected
- Tab state not persisting

### Performance
- Slow loading of sequence gallery
- Animation stuttering
- Memory issues with many sequences

### Mobile-Specific
- Touch targets too small
- Gestures not working
- Orientation issues

### Data & Sync
- Sequences not saving
- Favorites not syncing
- Settings not persisting
`;

/**
 * Build the complete knowledge base string
 */
export function buildKnowledgeBase(): string {
  return [
    DOMAIN_OVERVIEW,
    DOMAIN_GLOSSARY,
    APP_MODULES,
    UI_ELEMENTS,
    USER_TERMINOLOGY,
    KNOWN_ISSUES,
  ].join("\n");
}

/**
 * Build a compact version for smaller context windows
 */
export function buildCompactKnowledgeBase(): string {
  return [
    DOMAIN_OVERVIEW,
    DOMAIN_GLOSSARY,
    USER_TERMINOLOGY,
  ].join("\n");
}
