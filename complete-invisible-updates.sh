#!/bin/bash

# Components that still need init() and ngOnDestroy() method updates
components=(
  "content-card"
  "content-input" 
  "content-link"
  "content-multiselect"
  "content-spacer"
  "content-tabs"
  "content-video"
)

echo "Completing invisible-if implementation for remaining components..."

for component in "${components[@]}"; do
  echo "Updating $component init() and ngOnDestroy() methods..."
  
  # Update init method - add invisible watcher cleanup
  sed -i '' 's/if (this\.isHiddenWatcher) this\.isHiddenWatcher\.close();/if (this.isHiddenWatcher) this.isHiddenWatcher.close();\
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();/' "src/app/page/component/$component/$component.component.ts"
  
  # Update init method - add comment for gone-if watcher
  sed -i '' 's/this\.isHiddenWatcher = this\.item\.watchIsGone(/\/\/ Watch for gone-if expressions (removes from DOM)\
    this.isHiddenWatcher = this.item.watchIsGone(/' "src/app/page/component/$component/$component.component.ts"
  
  # Add invisible watcher after gone watcher (find the closing parenthesis and semicolon)
  sed -i '' '/this\.isHiddenWatcher = this\.item\.watchIsGone(/,/);$/{
    /);$/{
      a\
\
    // Watch for invisible-if expressions (hides but keeps space)\
    this.isInvisibleWatcher = this.item.watchIsInvisible(\
      this.state,\
      (value) => (this.isInvisible = value)\
    );
    }
  }' "src/app/page/component/$component/$component.component.ts"
  
  # Update ngOnDestroy method
  sed -i '' 's/if (this\.isHiddenWatcher) this\.isHiddenWatcher\.close();/if (this.isHiddenWatcher) this.isHiddenWatcher.close();\
    if (this.isInvisibleWatcher) this.isInvisibleWatcher.close();/' "src/app/page/component/$component/$component.component.ts"
  
done

echo "TypeScript updates completed!"
