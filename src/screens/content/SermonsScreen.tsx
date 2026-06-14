import React, { useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FaithMediaScreen from '../../components/content/FaithMediaScreen';
import faithMediaAPI from '../../services/faithMediaApi';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Sermons'>;

const SermonsScreen = ({ navigation }: Props) => {
  const loadItems = useCallback(() => faithMediaAPI.getSermons(), []);

  return (
    <FaithMediaScreen
      navigation={navigation}
      title="Sermons"
      subtitle="Messages, teachings, and spirit-lifting word sessions in the same media style as the app."
      accentColor="#7C3AED"
      icon="mic"
      actionLabel="Watch Now"
      searchPlaceholder="Search sermons, teachings, or messages..."
      featuredLabel="Featured Message"
      collectionTitle="Latest Sermons"
      continueTitle="Continue Watching"
      emptyTitle="No sermons found"
      emptySubtitle="Once sermon content is available from backend media, it will appear here."
      loadItems={loadItems}
    />
  );
};

export default SermonsScreen;
