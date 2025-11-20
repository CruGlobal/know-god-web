#!/bin/bash

# List of components to update (excluding ones already done: text, button, paragraph, image)
components=(
  "content-accordion"
  "content-animation" 
  "content-card"
  "content-input"
  "content-link"
  "content-multiselect"
  "content-spacer"
  "content-tabs"
  "content-video"
)

for component in "${components[@]}"; do
  echo "Updating $component..."
  
  # Update TypeScript file - add isInvisible property
  sed -i '' 's/isHidden: boolean;/isHidden: boolean;\
  isInvisible: boolean;/' "src/app/page/component/$component/$component.component.ts"
  
  # Update TypeScript file - add isInvisibleWatcher property  
  sed -i '' 's/isHiddenWatcher: FlowWatcher;/isHiddenWatcher: FlowWatcher;\
  isInvisibleWatcher: FlowWatcher;/' "src/app/page/component/$component/$component.component.ts"
  
  # Update init method - add invisible watcher cleanup
  sed -i '' 's/if (this.isHiddenWatcher) this.isHiddenWatcher.close();/if (this.isHiddenWatcher) this.isHiddenWatcher.close();\
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();/' "src/app/page/component/$component/$component.component.ts"
  
  # Update init method - add invisible watcher creation
  sed -i '' 's/this.isHiddenWatcher = this.item.watchIsGone(/\/\/ Watch for gone-if expressions (removes from DOM)\
    this.isHiddenWatcher = this.item.watchIsGone(/' "src/app/page/component/$component/$component.component.ts"
  
  # Add invisible watcher after gone watcher
  sed -i '' 's/);$/);\'$'\n''\'$'\n''    \/\/ Watch for invisible-if expressions (hides but keeps space)\'$'\n''    this.isInvisibleWatcher = this.item.watchIsInvisible(\'$'\n''      this.state,\'$'\n''      (value) => (this.isInvisible = value)\'$'\n''    );/' "src/app/page/component/$component/$component.component.ts"
  
  # Update ngOnDestroy method
  sed -i '' 's/if (this.isHiddenWatcher) this.isHiddenWatcher.close();/if (this.isHiddenWatcher) this.isHiddenWatcher.close();\
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();/' "src/app/page/component/$component/$component.component.ts"
  
done

echo "All components updated!"
