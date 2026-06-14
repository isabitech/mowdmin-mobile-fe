import React, { useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FaithMediaScreen from '../../components/content/FaithMediaScreen';
import faithMediaAPI from '../../services/faithMediaApi';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GospelMusic'>;

const GospelMusicScreen = ({ navigation }: Props) => {
  const loadItems = useCallback(() => faithMediaAPI.getGospelMusic(), []);

  return (
    <FaithMediaScreen
      navigation={navigation}
      title="Gospel Music"
      subtitle="Worship sounds, praise sessions, and faith-filled music for every moment."
      accentColor="#D97706"
      icon="musical-notes"
      actionLabel="Listen Now"
      searchPlaceholder="Search gospel music, worship, or praise..."
      featuredLabel="Featured Worship"
      collectionTitle="Worship Picks"
      continueTitle="Continue Listening"
      emptyTitle="No gospel music found"
      emptySubtitle="Once music content is available from backend media, it will appear here."
      loadItems={loadItems}
    />
  );
};

export default GospelMusicScreen;
