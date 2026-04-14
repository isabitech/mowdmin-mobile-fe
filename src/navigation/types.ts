export type RootStackParamList = {
  Onboarding: undefined;
  Register: undefined;
  Login: undefined;
  VerifyOTP: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  CompleteProfile: undefined;
  RegistrationSuccess: undefined;
  Tabs: undefined;
  Notifications: undefined;
  NotificationSettings: undefined;
  ShopStack: undefined; // New entry for the Shop Navigator
  Details: { id: string; title: string };
  EditProfile: undefined;
  SelectLanguage: undefined;
  GivingHistory: undefined;
  AboutMowdministries: undefined;
  Bible: undefined;
  BibleStories: undefined;
  Community: undefined;
  CreateNewGroup: undefined;
  GroupChat: { groupId: string; groupName?: string; groupImage?: string };
  ChangePassword: undefined;
  Membership: undefined;
  VideoPlayer: { videoUrl: string; title: string; author?: string };
};

export type ShopStackParamList = {
  ShopHome: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
};

export type TabParamList = {
  Home: undefined;
  Event: undefined;
  Media: undefined;
  PrayerWall: undefined;
  Profile: undefined;
};