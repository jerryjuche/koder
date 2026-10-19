# Mobile Design Patterns — CleanUI Reference

## iOS Rules

### The Feel
Quiet, soft, premium. Restrained color. Let content breathe.

### Colors
```
Background:       #F2F2F7  (systemGroupedBackground)
Surface/Card:     #FFFFFF  (secondarySystemGroupedBackground)
Text Primary:     #000000  (label)
Text Secondary:   #3C3C43 at 60% opacity (secondaryLabel)
Text Tertiary:    #3C3C43 at 30% opacity (tertiaryLabel)
Separator:        #3C3C43 at 18% opacity (separator)
Primary Action:   #007AFF  (systemBlue)
Success:          #34C759  (systemGreen)
Error:            #FF3B30  (systemRed)
Warning:          #FF9500  (systemOrange)
```

### Typography (SF Pro)
```
Large Title:  34pt bold     (navigation large titles)
Title:        28pt bold     (section headings)
Headline:     17pt semibold (list row titles)
Body:         17pt regular  (primary content)
Subheadline:  15pt regular  (secondary content)
Footnote:     13pt regular  (timestamps, metadata)
Caption:      12pt regular  (labels, tags)
```

### Components
- **Navigation**: large title collapses on scroll. Translucent nav/tab bars with blur.
- **Tab Bar**: max 5 tabs. SF Symbols: filled for selected, outlined for unselected. Always show labels.
- **Lists**: use `listStyle(.insetGrouped)`. Hairline separators inset from leading edge. Chevron (`>`) for drill-down rows.
- **Cards**: background `secondarySystemGroupedBackground`, corner radius 10-12pt, NO heavy shadows — use background contrast instead.
- **Buttons**: filled (primary) corner radius 12pt, height 50pt. Tinted (secondary): tint at 15% opacity bg.
- **Icons**: SF Symbols exclusively. Match symbol weight to text weight.
- **Sheets**: `.medium()` and `.large()` detents, grabber handle visible.

### iOS Transaction List Example
```swift
List {
    Section("Recent Transactions") {
        ForEach(transactions) { tx in
            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(.systemGray6))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Image(systemName: tx.categoryIcon)
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(.secondary)
                    )
                VStack(alignment: .leading, spacing: 2) {
                    Text(tx.title).font(.body)
                    Text("\(tx.category) · \(tx.dateFormatted)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text(tx.amount)
                    .font(.body.weight(.medium))
                    .foregroundStyle(tx.isPositive ? .green : .primary)
            }
            .padding(.vertical, 4)
        }
    }
}
.listStyle(.insetGrouped)
```

---

## Android Rules (Material 3)

### The Feel
Structured, bold, expressive. Stronger color presence than iOS. Clear component hierarchy.

### Colors (from seed #2563EB)
```
Primary:            #2563EB
OnPrimary:          #FFFFFF
PrimaryContainer:   #D6E2FF
OnPrimaryContainer: #001B3E
Secondary:          #575E71
SecondaryContainer: #DBE2F9
Surface:            #F9F9FF
SurfaceVariant:     #E0E2EC
OnSurface:          #1A1B20
OnSurfaceVariant:   #44474E
Outline:            #747680
OutlineVariant:     #C4C6D0
```

### Components
- **Scaffold**: always use `Scaffold` with `TopAppBar`, `NavigationBar`, optional `FloatingActionButton`. It handles insets, snackbars, FAB placement.
- **Navigation Bar**: 3-5 destinations. Filled/outlined icon toggle. Always show labels. Height 80dp. PrimaryContainer indicator pill.
- **Cards**: `ElevatedCard`, `FilledCard`, or `OutlinedCard`. Corner radius 12dp. Use `tonalElevation` not drop shadows.
- **Buttons**: `FilledButton` for primary (corner radius 20dp). Sentence case ("Save changes" not "SAVE CHANGES"). Height 40dp.
- **FAB**: one per screen max. Corner radius 16dp. PrimaryContainer color.
- **Text Fields**: `OutlinedTextField` preferred. Height 56dp. Always show a label.
- **Lists**: use `ListItem` composable. 56dp (one-line), 72dp (two-line). `HorizontalDivider()` between items.

### Android Transaction List Example
```kotlin
Card(
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(
        containerColor = MaterialTheme.colorScheme.surface
    )
) {
    transactions.forEachIndexed { index, tx ->
        ListItem(
            headlineContent = { Text(tx.title) },
            supportingContent = { Text("${tx.category} · ${tx.dateFormatted}") },
            leadingContent = {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.size(40.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = tx.categoryIcon,
                            contentDescription = tx.category,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            },
            trailingContent = {
                Text(
                    tx.amount,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    color = if (tx.isPositive)
                        MaterialTheme.colorScheme.tertiary
                    else
                        MaterialTheme.colorScheme.onSurface
                )
            }
        )
        if (index < transactions.lastIndex) {
            HorizontalDivider(
                modifier = Modifier.padding(start = 68.dp),
                color = MaterialTheme.colorScheme.outlineVariant
            )
        }
    }
}
```

---

## React Native / Expo Cross-Platform Rules

### Platform-Conditional Styling
```javascript
import { Platform } from "react-native";

export const colors = {
    background: Platform.select({ ios: "#F2F2F7", android: "#F9F9FF" }),
    surface: "#FFFFFF",
    primary: Platform.select({ ios: "#007AFF", android: "#2563EB" }),
    textPrimary: Platform.select({ ios: "#000000", android: "#1A1B20" }),
    textSecondary: Platform.select({ ios: "#8E8E93", android: "#44474E" }),
    separator: Platform.select({ ios: "#C6C6C8", android: "#C4C6D0" }),
};

export const radii = {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
};

export const shadows = Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
    },
    android: { elevation: 2 },
});
```

### Navigation (correct way)
```javascript
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

<Tab.Navigator
    screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
            const icons = {
                Home: focused ? "home" : "home-outline",
                Cards: focused ? "card" : "card-outline",
                Stats: focused ? "stats-chart" : "stats-chart-outline",
                Profile: focused ? "person" : "person-outline",
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: Platform.select({ ios: "#007AFF", android: "#2563EB" }),
    })}
>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Cards" component={CardsScreen} />
    <Tab.Screen name="Stats" component={StatsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
```

### Token Sheet

**iOS:**
```
Card Radius: 10    Button Radius: 10    Button Height: 50
Row Height: 44     Avatar Size: 40      Font Body: 17
Font Title: 28     Font Large Title: 34  Font Caption: 12
```

**Android (Material 3):**
```
Card Radius: 12dp    Button Radius: 20dp (filled), 12dp (outlined)
Button Height: 40dp  Nav Bar Height: 80dp  Row Height: 56dp (single), 72dp (two-line)
Avatar Size: 40dp    Font Body: 16sp       Font Title: 22sp
Font Display: 36sp   Font Label: 14sp
```
