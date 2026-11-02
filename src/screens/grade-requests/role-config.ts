import { ROUTES } from '@/navigation/routes';
import type { GradeRequestRole } from '@/services/grade-requests';

/** Everything that differs between the customer and seller grade-request flows. */
export type GradeRequestRoleConfig = {
  listTitle: string;
  newTitle: string;
  submittedTitle: string;
  listRoute: string;
  /** Stable destination when the screen is the stack root (deep link / notification). */
  fallbackRoute: string;
  newRoute: string;
  detailsRoute: string;
  /** Where "search existing grades first" and the success "back" action lead. */
  browseRoute: string;
  browseLabel: string;
  doneLabel: string;
  gradeDetailsRoute: string | null;
  newIntro: string;
  emptyTitle: string;
  emptyDescription: string;
  newCtaLabel: string;
  deliveryLabel: string;
  deliveryPlaceholder: string;
  contactCaption: (companyName: string) => string;
  nextSteps: string[];
  needsResponseMessage: string;
  loadErrorTitle: string;
  resolvedHint: string | null;
  resolvedActionLabel: (gradeName: string) => string;
};

export const GRADE_REQUEST_ROLE_CONFIG: Record<GradeRequestRole, GradeRequestRoleConfig> = {
  customer: {
    listTitle: 'Grade requests',
    newTitle: 'Request a new grade',
    submittedTitle: 'Request submitted',
    listRoute: ROUTES.CUSTOMER.GRADE_REQUESTS,
    fallbackRoute: ROUTES.CUSTOMER.PROFILE,
    newRoute: ROUTES.CUSTOMER.GRADE_REQUEST_NEW,
    detailsRoute: ROUTES.CUSTOMER.GRADE_REQUEST_DETAILS,
    browseRoute: ROUTES.CUSTOMER.GRADES,
    browseLabel: 'Search existing grades first →',
    doneLabel: 'Back to grades',
    gradeDetailsRoute: ROUTES.CUSTOMER.GRADE_DETAILS,
    newIntro: "Can't find the grade you need? Tell us about it and our team will source or add it.",
    emptyTitle: 'No grade requests yet',
    emptyDescription:
      "If you can't find a grade in the catalogue, request it and we will source it for you.",
    newCtaLabel: 'Request a new grade',
    deliveryLabel: 'Delivery location *',
    deliveryPlaceholder: 'City, state — or a full delivery address',
    contactCaption: (company) => `Requesting on behalf of ${company}.`,
    nextSteps: [
      'Our team reviews the technical details.',
      'We may ask you for more information — you will be notified.',
      'Once the grade is identified, you can raise a purchase request.',
    ],
    needsResponseMessage: 'We need more information from you.',
    loadErrorTitle: 'Unable to load requests',
    resolvedHint: null,
    resolvedActionLabel: (name) => `View grade ${name}`,
  },
  seller: {
    listTitle: 'Grade Requests',
    newTitle: 'Request New Grade',
    submittedTitle: 'Request Submitted',
    listRoute: ROUTES.SELLER.GRADE_REQUESTS,
    fallbackRoute: ROUTES.SELLER.PROFILE,
    newRoute: ROUTES.SELLER.GRADE_REQUEST_NEW,
    detailsRoute: ROUTES.SELLER.GRADE_REQUEST_DETAILS,
    browseRoute: ROUTES.SELLER.ADD_PRODUCT,
    browseLabel: 'Search the Grade Master first →',
    doneLabel: 'Back to Add Product',
    gradeDetailsRoute: null,
    newIntro:
      "Can't find your grade in the Grade Master? Request it and our team will add it so you can list and offer it to buyers.",
    emptyTitle: 'No grade requests yet',
    emptyDescription:
      "If a grade you sell isn't in the Grade Master, request it. Once it's added you can list it from Add Product.",
    newCtaLabel: 'Request new grade',
    deliveryLabel: 'Warehouse / dispatch location *',
    deliveryPlaceholder: 'City, state — or the full warehouse address',
    contactCaption: (company) => `Requesting for ${company}.`,
    nextSteps: [
      'Our team reviews the technical details.',
      'We may ask you for more information — you will be notified.',
      'Once the grade is added to the catalogue, you can list or offer it from Add Product.',
    ],
    needsResponseMessage: 'We need more information from you to add this grade.',
    loadErrorTitle: 'Unable to load grade requests',
    resolvedHint:
      'This grade is now in the catalogue. Go to Add Product and pick it from the grade picker to list or offer it.',
    resolvedActionLabel: (name) => `List ${name} now`,
  },
};

export const firstParam = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;
