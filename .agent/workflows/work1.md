---
description: 
---

---
name: new-component
description: Crée un nouveau composant React pour The Breakery ERP
---

# Instructions

Crée un nouveau composant React avec les spécifications suivantes :

1. **Structure** :
   - Fichier principal : `src/components/{ComponentName}/{ComponentName}.tsx`
   - Types : `src/components/{ComponentName}/{ComponentName}.types.ts`
   - Index : `src/components/{ComponentName}/index.ts`

2. **Template de base** :
```tsx
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { {ComponentName}Props } from './{ComponentName}.types';

export const {ComponentName}: FC<{ComponentName}Props> = ({ ...props }) => {
  const { t } = useTranslation();
  
  return (
    <div className="...">
      {/* Contenu */}
    </div>
  );
};
```

3. **Ajoute** :
   - Les props typées
   - Les traductions nécessaires (FR, EN, ID)
   - Un export dans l'index

Demande-moi le nom du composant et sa fonction.