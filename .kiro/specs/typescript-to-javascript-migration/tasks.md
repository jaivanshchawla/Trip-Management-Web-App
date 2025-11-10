# Implementation Plan: TypeScript to JavaScript Migration

- [x] 1. Convert utility and interface files





  - Convert src/utils/interface.ts to src/utils/interface.js with JSDoc comments for key type definitions
  - Convert all other files in src/utils/ directory from .ts to .js, removing type annotations
  - Convert all files in src/helpers/ directory from .ts to .ts, removing type annotations
  - Update any imports in these files to reference .js extensions where needed
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.5_

- [x] 2. Convert store and state management files





  - Convert src/store/store.ts to .js, removing RootState and AppDispatch type exports
  - Convert src/store/api.ts to .js, removing type parameters from RTK Query
  - Convert src/store/tripsSlice.ts to .js, removing type parameters
  - Convert src/store/hooks.ts to .js, removing typed hooks
  - _Requirements: 1.1, 1.2, 1.3, 4.2, 4.5_
-

- [-] 3. Convert context providers


  - Convert all files in src/context/ directory from .tsx to .jsx
  - Remove type definitions for context values and provider props
  - Remove generic type parameters from createContext calls
  - Keep all state management and provider logic intact
  - _Requirements: 1.1, 1.2, 1.5, 4.2, 4.5_

- [ ] 4. Convert service files
  - Convert src/services/expiryCheckService.ts to .js
  - Convert src/services/notificationService.ts to .js
  - Remove type annotations while preserving all service logic
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Convert Firebase configuration files
  - Convert src/firebase/firbaseConfig.ts to .js
  - Convert src/firebase/firebaseAdmin.ts to .js
  - Remove type imports and annotations
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 6. Convert UI component library
  - Convert all files in src/components/ui/ directory from .tsx to .jsx
  - Remove React.FC type annotations and prop interface definitions
  - Keep all component logic and styling intact
  - Update imports between UI components
  - _Requirements: 1.1, 1.2, 1.5, 4.5_

- [ ] 7. Convert custom hooks
  - Convert src/components/hooks/use-toast.ts to .js
  - Convert src/components/hooks/useAnimatedNumber.ts to .js
  - Convert src/components/hooks/useExpenseData.ts to .js
  - Remove type annotations and return type definitions
  - _Requirements: 1.1, 1.2, 1.3, 4.2_

- [ ] 8. Convert shared layout components
  - Convert all files in src/components/layout/ from .tsx to .jsx
  - Remove prop type definitions
  - Keep layout logic and structure intact
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 9. Convert feature-specific components (driver, party, supplier)
  - Convert all files in src/components/driver/ from .tsx to .jsx
  - Convert all files in src/components/party/ from .tsx to .jsx
  - Convert all files in src/components/supplier/ from .tsx to .jsx
  - Remove type annotations and interface definitions
  - Update imports between related components
  - _Requirements: 1.1, 1.2, 1.5, 4.5_

- [ ] 10. Convert feature-specific components (trip, truck, documents)
  - Convert all files in src/components/trip/ and subdirectories from .tsx to .jsx
  - Convert all files in src/components/truck/ from .tsx to .jsx
  - Convert all files in src/components/documents/ from .tsx to .jsx
  - Remove type annotations and interface definitions
  - _Requirements: 1.1, 1.2, 1.5, 4.5_

- [ ] 11. Convert feature-specific components (search, shopkhata, admin)
  - Convert all files in src/components/search/ from .tsx to .jsx
  - Convert all files in src/components/shopkhata/ from .tsx to .jsx
  - Convert all files in src/components/admin/ from .tsx to .jsx
  - Remove type annotations and interface definitions
  - _Requirements: 1.1, 1.2, 1.5, 4.5_

- [ ] 12. Convert root-level shared components
  - Convert all remaining .tsx files in src/components/ root directory to .jsx
  - This includes files like Navigation.tsx, Footer.tsx, HeroSection.tsx, etc.
  - Remove prop type definitions and React.FC annotations
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 13. Convert app layout and root page files
  - Convert src/app/layout.tsx to .jsx, removing Metadata type import
  - Convert src/app/page.tsx to .jsx
  - Convert src/app/global-error.tsx to .jsx
  - Convert src/app/not-found.tsx to .jsx
  - Convert src/app/sitemap.ts to .js
  - _Requirements: 1.1, 1.2, 1.5, 4.5_

- [ ] 14. Convert public-facing page routes
  - Convert src/app/about/page.tsx to .jsx
  - Convert src/app/contact/page.tsx to .jsx
  - Convert src/app/privacy-policy/page.tsx to .jsx
  - Convert src/app/terms/page.tsx to .jsx
  - Convert src/app/expense-management/page.tsx to .jsx
  - Convert src/app/route-optimization/page.tsx to .jsx
  - Convert src/app/trip-management/page.tsx to .jsx
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 15. Convert login and admin layout pages
  - Convert src/app/login/layout.tsx and page.tsx to .jsx
  - Convert src/app/(admin)/layout.tsx to .jsx
  - Convert src/app/(admin)/admin-login/page.tsx to .jsx (if exists)
  - Convert src/app/(admin)/admin-page/page.tsx to .jsx (if exists)
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 16. Convert user dashboard pages (main sections)
  - Convert src/app/user/layout.tsx, loading.tsx, and page.tsx to .jsx
  - Convert src/app/user/home/page.tsx to .jsx (and any nested files)
  - Convert src/app/user/profile/page.tsx to .jsx (and any nested files)
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 17. Convert user dashboard pages (data management)
  - Convert all page files in src/app/user/drivers/ to .jsx
  - Convert all page files in src/app/user/parties/ to .jsx
  - Convert all page files in src/app/user/suppliers/ to .jsx
  - Convert all page files in src/app/user/trucks/ to .jsx
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 18. Convert user dashboard pages (operations)
  - Convert all page files in src/app/user/trips/ to .jsx
  - Convert all page files in src/app/user/expenses/ to .jsx
  - Convert all page files in src/app/user/invoice/ to .jsx
  - Convert all page files in src/app/user/documents/ to .jsx
  - Convert all page files in src/app/user/search/ to .jsx
  - Convert all page files in src/app/user/shopkhata/ to .jsx
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 19. Convert API routes (admin, auth, dashboard)
  - Convert all route.ts files in src/app/api/admin/ to route.js
  - Convert all route.ts files in src/app/api/login/ to route.js
  - Convert all route.ts files in src/app/api/logout/ to route.js
  - Convert all route.ts files in src/app/api/dashboard/ to route.js
  - Remove NextRequest and NextResponse type annotations
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 20. Convert API routes (data entities)
  - Convert all route.ts files in src/app/api/drivers/ to route.js
  - Convert all route.ts files in src/app/api/parties/ to route.js
  - Convert all route.ts files in src/app/api/suppliers/ to route.js
  - Convert all route.ts files in src/app/api/trucks/ to route.js
  - Convert all route.ts files in src/app/api/users/ to route.js
  - Remove type annotations from request handlers
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 21. Convert API routes (operations and services)
  - Convert all route.ts files in src/app/api/trips/ to route.js
  - Convert all route.ts files in src/app/api/expenses/ to route.js
  - Convert all route.ts files in src/app/api/invoices/ to route.js
  - Convert all route.ts files in src/app/api/tripCharges/ to route.js
  - Convert all route.ts files in src/app/api/documents/ to route.js
  - Convert all route.ts files in src/app/api/files/ to route.js
  - Convert all route.ts files in src/app/api/notifications/ to route.js
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 22. Convert API routes (utilities and external)
  - Convert all route.ts files in src/app/api/s3Upload/ to route.js
  - Convert all route.ts files in src/app/api/generateReport/ to route.js
  - Convert all route.ts files in src/app/api/search/ to route.js
  - Convert all route.ts files in src/app/api/contact/ to route.js
  - Convert all route.ts files in src/app/api/schedule-demo/ to route.js
  - Convert all route.ts files in src/app/api/shopkhata/ to route.js
  - Convert all route.ts files in src/app/api/cron/ to route.js
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 23. Convert middleware
  - Convert src/middleware.ts to .js
  - Remove NextRequest and NextResponse type annotations
  - Keep all authentication and routing logic intact
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 24. Convert remaining utility files
  - Convert src/lib/analytics.tsx to .jsx
  - Convert src/lib/utils.ts to .js
  - Convert src/utils/DocGeneration.tsx to .jsx
  - Convert src/utils/EwayBillColor.tsx to .jsx
  - Convert src/utils/icons.tsx to .jsx
  - Convert src/utils/renderTripCell.tsx to .jsx
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 25. Update configuration files
  - Rename tsconfig.json to jsconfig.json
  - Update jsconfig.json to use JavaScript settings (change include patterns from .ts/.tsx to .js/.jsx)
  - Update package.json to remove TypeScript and all @types/* packages from devDependencies
  - Delete or rename next-env.d.ts file
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 26. Verify build and fix any remaining issues
  - Run npm install to update dependencies based on new package.json
  - Run npm run build to verify the project builds successfully
  - Fix any import resolution errors or syntax errors that appear
  - Ensure no TypeScript-related errors remain
  - _Requirements: 3.1, 3.2, 3.5_

- [ ] 27. Test application functionality
  - Start development server with npm run dev
  - Verify home page loads correctly
  - Test login functionality
  - Navigate through user dashboard sections
  - Test CRUD operations for drivers, parties, trucks, and trips
  - Verify API endpoints respond correctly
  - Check browser console for any runtime errors
  - _Requirements: 3.2, 3.3, 3.4_
