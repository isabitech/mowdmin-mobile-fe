import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Register: undefined;
  Login: undefined;
  VerifyOTP: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  CompleteProfile: undefined;
  RegistrationSuccess: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
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
  GospelMusic: undefined;
  Sermons: undefined;
  Testimonies: undefined;
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
  Event: { eventId?: string } | undefined;
  Media: undefined;
  PrayerWall: undefined;
  Profile: undefined;
};
