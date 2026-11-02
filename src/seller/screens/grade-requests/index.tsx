import {
  GradeRequestDetailScreen,
  GradeRequestsScreen,
  NewGradeRequestScreen,
} from '@/screens/grade-requests';

/** Seller entry points — the shared grade-request screens bound to `/seller/grade-requests`. */
export const SellerGradeRequestsScreen = () => <GradeRequestsScreen role="seller" />;
export const SellerNewGradeRequestScreen = () => <NewGradeRequestScreen role="seller" />;
export const SellerGradeRequestDetailScreen = () => <GradeRequestDetailScreen role="seller" />;
