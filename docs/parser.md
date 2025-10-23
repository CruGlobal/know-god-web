# GodTools Parser Documentation

This document describes the XML parser system used in the know-god-web application to render GodTools content.

## Overview

The parser converts GodTools XML manifests into TypeScript/JavaScript objects that can be rendered in the web application.

### Content Creation and Publishing Flow

Admins create and edit GodTools content through the **mobile-content-admin** application, which provides tools to author XML pages based on the defined schema. Once content is created and approved, the XML files are published and made available to client applications.

### Parsing Flow

```
XML Files (created in mobile-content-admin)
    ↓
Kotlin Multiplatform Parser (kotlin-mpp-godtools-tool-parser)
    ↓
NPM Package (@cruglobal/godtools-shared)
    ↓
This Web Application (know-god-web)
```

### Package Information

- **NPM Package**: `@cruglobal/godtools-shared`
- **Source Repository**: [kotlin-mpp-godtools-tool-parser](https://github.com/CruGlobal/kotlin-mpp-godtools-tool-parser)
- **XML API/Schema**: [mobile-content-admin](https://github.com/CruGlobal/mobile-content-admin)

## XML Structure

### Manifest Root Element

Every GodTools tool starts with a `<manifest>` root element that defines the tool type and global properties.

#### Manifest Types

- **`tract`** (default): Traditional tract-style presentation with hero images, cards, and call-to-action sections
- **`lesson`**: Structured lesson pages with navigation
- **`cyoa`**: Choose-Your-Own-Adventure style with non-linear navigation
- **`article`**: Article-style content (with AEM imports)

#### Key Manifest Attributes

```xml
<manifest
  xmlns="https://godtoolsapp.com"
  tool="knowgod"
  locale="en"
  type="tract"
  primary-color="#3BA4DB"
  primary-text-color="#FFFFFF"
  text-color="#5A5A5A"
  background-color="#FFFFFF">
  <!-- content -->
</manifest>
```

### Page Types

Pages are the main navigational units in a tool. Each tool type supports may different page types.

### Content Elements

Content elements are the building blocks within pages. The parser supports many different content types:

| Content Type    | Description                               | XML Element     |
| --------------- | ----------------------------------------- | --------------- |
| **Text**        | Styled text with formatting               | `<text>`        |
| **Paragraph**   | Text container with spacing               | `<paragraph>`   |
| **Image**       | Images with scaling options               | `<image>`       |
| **Video**       | Embedded video players                    | `<video>`       |
| **Button**      | Interactive buttons                       | `<button>`      |
| **Link**        | Clickable links                           | `<link>`        |
| **Card**        | Content card container                    | `<card>`        |
| **Accordion**   | Expandable/collapsible sections           | `<accordion>`   |
| **Tabs**        | Tabbed content interface                  | `<tabs>`        |
| **Form**        | Input forms with fields                   | `<form>`        |
| **Input**       | Form input fields                         | `<input>`       |
| **Spacer**      | Vertical spacing                          | `<spacer>`      |
| **Animation**   | Lottie animations                         | `<animation>`   |
| **Multiselect** | Multiple choice selection                 | `<multiselect>` |
| **Flow**        | Flowing content layout                    | `<flow>`        |
| **Fallback**    | Fallback content for unsupported features | `<fallback>`    |

## Parser Usage in This Application

### Parser Configuration

The parser is configured with feature flags that determine what content can be rendered:

```typescript
const config = ParserConfig.createParserConfig()
  .withLegacyWebImageResources(true)
  .withSupportedFeatures([
    ParserConfig.Companion.FEATURE_ANIMATION,
    ParserConfig.Companion.FEATURE_MULTISELECT,
    ParserConfig.Companion.FEATURE_FLOW,
    ParserConfig.Companion.FEATURE_CONTENT_CARD
  ])
  .withParseTips(false);
```

**Location**: `src/app/page/page.component.ts`

### XmlParserService Initialization

The `PullParserFactory` is a custom implementation that fetches XML files over HTTP:

```typescript
class JsXmlPullParserFactory extends org.cru.godtools.shared.tool.parser.xml.JsXmlPullParserFactory {
  override fun getXmlParser(filename: String): XmlPullParser? {
    // Fetch file via HTTP
    // Decode as UTF-8
    // Return parser
  }
}
```

**Location**: `src/app/services/xml-parser-service/xml-parser.service.ts`

### Parsing a Manifest

Manifests are parsed asynchronously:

```typescript
const parser = new ManifestParser(pullParserFactory, config);
const result = await parser.parseManifest(fileName, signal);

if (result instanceof ParserResult.Data) {
  const manifest = result.manifest;
  // Use manifest.pages, manifest.resources, etc.
}
```

### State Management

The parser uses a `State` object to track dynamic values during rendering:

```typescript
import { State } from '@cruglobal/godtools-shared';

const parserState = State.createState();
```

The state object:

- Stores variables set by user interactions
- Evaluates conditional expressions (`invisibleIf`, `goneIf`)
- Resolves dynamic event IDs
- Tracks analytics events

### Component Mapping

The template maps content types to specific components:

| Content Type  | Angular Component             | Location                                      |
| ------------- | ----------------------------- | --------------------------------------------- |
| `text`        | `ContentTextComponent`        | `src/app/page/component/content-text/`        |
| `image`       | `ContentImageComponent`       | `src/app/page/component/content-image/`       |
| `paragraph`   | `ContentParagraphComponent`   | `src/app/page/component/content-paragraph/`   |
| `button`      | `ContentButtonComponent`      | `src/app/page/component/content-button/`      |
| `link`        | `ContentLinkComponent`        | `src/app/page/component/content-link/`        |
| `card`        | `ContentCardComponent`        | `src/app/page/component/content-card/`        |
| `video`       | `ContentVideoComponent`       | `src/app/page/component/content-video/`       |
| `form`        | `ContentFormComponent`        | `src/app/page/component/content-form/`        |
| `input`       | `ContentInputComponent`       | `src/app/page/component/content-input/`       |
| `accordion`   | `ContentAccordionComponent`   | `src/app/page/component/content-accordion/`   |
| `tabs`        | `ContentTabsComponent`        | `src/app/page/component/content-tabs/`        |
| `animation`   | `ContentAnimationComponent`   | `src/app/page/component/content-animation/`   |
| `multiselect` | `ContentMultiselectComponent` | `src/app/page/component/content-multiselect/` |
| `flow`        | `ContentFlowComponent`        | `src/app/page/component/content-flow/`        |
| `spacer`      | `ContentSpacerComponent`      | `src/app/page/component/content-spacer/`      |

### Full Flow Example

```
XML:
<page>
  <content:paragraph>
    <content:text text-color="#333333">Hello World</content:text>
  </content:paragraph>
</page>

↓ (Kotlin Parser)

TypeScript Object:
Paragraph {
  content: [
    Text {
      text: "Hello World",
      textColor: Color(51, 51, 51)
    }
  ]
}

↓ (ContentRepeater)

ContentParagraphComponent receives Paragraph
  ↓
ContentTextComponent receives Text
  ↓
Renders: <span style="color: #333333">Hello World</span>
```

## Event System

The event system enables interactive navigation and actions within GodTools content.

### EventId Structure

Events are identified by an `EventId` object:

```typescript
class EventId {
  namespace: string | null; // Optional namespace
  name: string; // Event name
}
```

Events can be specified in XML as:

- `name` - Simple event (e.g., `next-page`)
- `namespace:name` - Namespaced event (e.g., `state:selectedOption`)

**Kotlin Definition**: `kotlin-mpp-godtools-tool-parser/module/parser-base/src/commonMain/kotlin/org/cru/godtools/shared/tool/parser/model/EventId.kt`

### Special Event Namespaces

#### `state:` Namespace

Events with the `state:` namespace are **dynamic** and resolved at runtime from the parser State:

```typescript
// XML: events="state:selectedOption"
// If State has: selectedOption = ["option-a", "option-b"]
// Then resolve() returns: [EventId("option-a"), EventId("option-b")]

eventId.resolve(state);
```

This allows content to trigger different navigation based on user choices stored in State.

**Kotlin Implementation**: `kotlin-mpp-godtools-tool-parser/module/renderer-state/src/commonMain/kotlin/org/cru/godtools/shared/tool/parser/model/EventId+State.kt`

#### `followup:` Namespace

Special namespace for follow-up actions: `EventId.FOLLOWUP = EventId("followup", "send")`

### Events on Content Elements

Interactive content elements can trigger events when clicked:

```typescript
// Button with event
<Button
  text="Next"
  events={[EventId("next-page")]}
/>

// Image with multiple events
<Image
  resource="image.png"
  events={[EventId("zoom"), EventId("track-click")]}
/>

// Card with state-based navigation
<Card
  events={[EventId("state", "userChoice")]}
/>
```

Components that support events:

- **Button** (`src/app/page/component/content-button/content-button.component.ts`)
- **Link** (`src/app/page/component/content-link/content-link.component.ts`)
- **Image** (`src/app/page/component/content-image/content-image.component.ts`)
- **Card** (`src/app/page/component/content-card/content-card.component.ts`)
- **Animation** (for interactive animations)

### Page Listeners

Pages declare which events will navigate to/from them:

#### `listeners` - Navigate TO This Page

When an event matching a page's `listeners` is triggered, the app navigates TO that page:

```xml
<page id="page-2" listeners="next-page option-a">
  <!-- This page is shown when "next-page" or "option-a" event fires -->
</page>
```

#### `dismissListeners` - Navigate FROM This Page

When an event matching a page's `dismissListeners` is triggered, the app navigates AWAY from that page (back in navigation stack):

```xml
<page id="modal" dismiss-listeners="close-modal back">
  <!-- Clicking "close-modal" or "back" navigates back -->
</page>
```

**Kotlin Definition**: `kotlin-mpp-godtools-tool-parser/module/parser/src/commonMain/kotlin/org/cru/godtools/shared/tool/parser/model/page/Page.kt`

### Manifest Dismiss Listeners

Manifest-level dismiss listeners exit the entire tool:

```xml
<manifest dismiss-listeners="close-tool exit">
  <!-- Triggering "close-tool" or "exit" returns to tool list -->
</manifest>
```

### Navigation Flow

Here's how event-based navigation works:

```
1. User clicks button with events=["next-page"]
   ↓
2. ContentButtonComponent calls:
   pageService.formAction(formatEvents(this.events))
   // formatEvents converts EventId[] to string "next-page"
   ↓
3. PageService emits formAction$ observable with "next-page"
   ↓
4. PageComponent.awaitPageEvent() is listening:
   - Filters for known events (all page listeners + dismissListeners)
   - Calls navigateToPageOnEvent("next-page")
   ↓
5. navigateToPageOnEvent searches all pages:
   - Finds page with "next-page" in its listeners
   - Adds page to navigation stack (for CYOA)
   - Navigates to that page
```

**Key Files**:

- Format events: `src/app/shared/formatEvents.ts`
- Trigger action: `src/app/page/component/content-button/content-button.component.ts`
- Listen for events: `src/app/page/page.component.ts`
- Navigate to page: `src/app/page/page.component.ts`

### CYOA Navigation Stack

For Choose-Your-Own-Adventure tools, navigation is non-linear (e.g., page 0 → 14 → 5). The `PageService` maintains a navigation stack:

```typescript
// User navigates: Page 0 → Page 5 → Page 12
// Navigation stack: ["0", "5", "12"]

// User triggers dismiss listener (e.g., "back")
// Pops from stack, navigates to Page 5
// Navigation stack: ["0", "5"]
```

**Stack Methods**:

- `addToNavigationStack(pagePosition)` - Add page to stack
- `removeFromNavigationStack(pagePosition?)` - Go back to page (or previous if none specified)
- `ensurePageIsLatestInNavigationStack(pagePosition)` - Ensure page is at top of stack
- `clearNavigationStack()` - Reset stack

**Location**: `src/app/page/service/page-service.service.ts`

### Event Resolution with State

Example of dynamic navigation using `state:` events:

```xml
<!-- Multiselect sets state variable -->
<multiselect id="choice" state-var="userChoice">
  <option value="option-a">Option A</option>
  <option value="option-b">Option B</option>
</multiselect>

<!-- Button triggers state-based event -->
<button events="state:userChoice">Continue</button>

<!-- Pages listen for specific values -->
<page id="page-a" listeners="option-a">
  <!-- Shown if user chose Option A -->
</page>

<page id="page-b" listeners="option-b">
  <!-- Shown if user chose Option B -->
</page>
```

**Flow**:

1. User selects "Option A" in multiselect
2. State sets: `userChoice = ["option-a"]`
3. User clicks "Continue" button
4. `EventId("state", "userChoice").resolve(state)` returns `[EventId("option-a")]`
5. System finds page with `listeners="option-a"`
6. Navigates to that page

## Key Concepts

### Parser Features

Features must be enabled in `ParserConfig` for content to render:

- `FEATURE_ANIMATION` - Lottie animations
- `FEATURE_MULTISELECT` - Multiple choice selections
- `FEATURE_FLOW` - Flowing content layouts
- `FEATURE_CONTENT_CARD` - Content cards
- `FEATURE_PAGE_COLLECTION` - Nested page collections
- `FEATURE_REQUIRED_VERSIONS` - Version requirement checks

Content requiring unsupported features is filtered out during parsing.

### Style Inheritance

Styles cascade from Manifest → Page → Content:

```
Manifest.primaryColor = #3BA4DB
  ↓
Page.primaryColor (if not set, inherits #3BA4DB)
  ↓
Content.textColor (if not set, inherits from page/manifest)
```

Properties that inherit:

- `primaryColor` / `primaryTextColor`
- `textColor` / `textScale`
- `cardBackgroundColor`
- `multiselectOptionBackgroundColor` / `multiselectOptionSelectedColor`

**Implementation**: `kotlin-mpp-godtools-tool-parser/module/parser/src/commonMain/kotlin/org/cru/godtools/shared/tool/parser/model/Styles.kt`

### Visibility Expressions

Content can be conditionally visible using expressions:

```xml
<content:text
  text="You selected yes!"
  invisible-if="!user_selected_yes"
/>

<content:button
  text="Continue"
  gone-if="!form_complete"
/>
```

- `invisible-if`: Content takes up space but is not visible
- `gone-if`: Content is removed from layout entirely

Expressions are evaluated using the parser State and support:

- Variable references: `user_selected_yes`
- Boolean operators: `!`, `&&`, `||`
- Comparisons: `==`, `!=`, `>`, `<`, `>=`, `<=`

**Kotlin Implementation**: `kotlin-mpp-godtools-tool-parser/module/parser-expressions/`

### Resource Resolution

Resources (images, videos, animations) are referenced by name and resolved through the manifest:

```typescript
// In manifest
resources: {
  "hero-image": Resource {
    name: "hero-image",
    localName: "hero.jpg",
    isZipped: false
  }
}

// In content
image.resource = "hero-image"

// Resolution
const resource = manifest.resources.get("hero-image");
// resource.localName = "hero.jpg"
```

The `PageService` caches URLs for resources after they're fetched:

```typescript
pageService.addToImagesDict('hero-image', 'https://cdn.example.com/hero.jpg');
const url = pageService.getImageUrl('hero-image');
```

**Location**: `src/app/page/service/page-service.service.ts`

## Additional Resources

- **Kotlin Parser Source**: [kotlin-mpp-godtools-tool-parser](https://github.com/CruGlobal/kotlin-mpp-godtools-tool-parser)
- **XML Content Admin**: [mobile-content-admin](https://github.com/CruGlobal/mobile-content-admin)
- **Page Component**: `src/app/page/page.component.ts`
- **Content Repeater**: `src/app/page/component/content-repeater/content-repeater.component.ts`
