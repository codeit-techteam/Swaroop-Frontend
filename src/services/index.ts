export {
  configureNotifications,
  getNotificationPermissions,
  notificationConfig,
} from '@/services/notification-service';
export { firebaseConfig, initializeFirebase } from '@/services/firebase-service';
export { mapsConfig, getMapsApiKey } from '@/services/maps-service';
export {
  fetchCurrentDeliveryAddress,
  lookupPincode,
  requestLocationPermission,
} from '@/services/location';
export {
  fetchSavedAddresses,
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
} from '@/services/addresses';
export {
  saveAuth,
  getAuth,
  saveUser,
  getUser,
  clearUser,
  saveBusinessInfo,
  getBusinessInfo,
  saveDocuments,
  getDocuments,
  saveKYC,
  getKYC,
  saveAppSettings,
  getAppSettings,
  getSessionSnapshot,
  clearAll,
} from '@/services/storage';
export { validateDevOtp, getInvalidOtpMessage, isDevAccount } from '@/services/dev-auth';
export {
  getCurrentUser,
  saveCurrentUser,
  clearUserData,
  isDemoUser,
  logout as logoutSession,
} from '@/services/user-session';
export { addToCart, getCart, clearCart } from '@/services/cart';
export { fetchCustomerDocumentsCatalog } from '@/services/documents';
export {
  fetchCustomerNotifications,
  fetchCustomerUnreadCount,
  markCustomerNotificationRead,
  markAllCustomerNotificationsRead,
} from '@/services/notifications';
