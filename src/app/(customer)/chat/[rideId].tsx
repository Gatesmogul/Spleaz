import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

interface ChatMessage {
  id: string;
  sender: 'CUSTOMER' | 'DRIVER';
  text: string;
  timestamp: string;
}

interface DriverProfile {
  name: string;
  phone: string;
  vehicleModel: string;
  plateNumber: string;
  photoUrl: string;
  isOnline: boolean;
}

// Quick reply canned messages for fast customer responses
const QUICK_REPLIES = [
  "I'm at the pickup point 📍",
  "I'm wearing a red shirt 👕",
  "Please wait 2 minutes ⏱️",
  "Are you nearby? 🚘",
];

export default function CustomerDriverChatScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');

  // Driver details
  const driver: DriverProfile = {
    name: 'Akinwumi Adeleke',
    phone: '+2348039876543',
    vehicleModel: 'Toyota Corolla',
    plateNumber: 'KJA 452 AB',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    isOnline: true,
  };

  // Chat message history state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'DRIVER',
      text: 'Hello! I am on my way to your pickup location.',
      timestamp: '10:42 AM',
    },
    {
      id: '2',
      sender: 'CUSTOMER',
      text: 'Great, thanks! I am standing near the main gate.',
      timestamp: '10:43 AM',
    },
    {
      id: '3',
      sender: 'DRIVER',
      text: 'Got it! I will be there in about 3 minutes.',
      timestamp: '10:43 AM',
    },
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || inputText.trim();
    if (!content) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'CUSTOMER',
      text: content,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (!textToSend) setInputText('');

    // Simulate driver automated reply after 2 seconds
    setTimeout(() => {
      const driverReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'DRIVER',
        text: 'Thanks for letting me know! See you shortly.',
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, driverReply]);
    }, 2000);
  };

  const handleCallDriver = () => {
    Linking.openURL(`tel:${driver.phone}`).catch(() =>
      Alert.alert('Error', 'Unable to initiate call from this device.')
    );
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isCustomer = item.sender === 'CUSTOMER';

    return (
      <View
        style={[
          styles.messageRow,
          isCustomer ? styles.customerMessageRow : styles.driverMessageRow,
        ]}
      >
        {!isCustomer && (
          <Image source={{ uri: driver.photoUrl }} style={styles.chatAvatar} />
        )}

        <View
          style={[
            styles.messageBubble,
            isCustomer
              ? [styles.customerBubble, { backgroundColor: theme.colors.primary }]
              : [styles.driverBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isCustomer ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestampText,
              { color: isCustomer ? 'rgba(255,255,255,0.7)' : theme.colors.subtext },
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* HEADER BAR */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>

        <Image source={{ uri: driver.photoUrl }} style={styles.headerAvatar} />

        <View style={styles.headerInfo}>
          <Text style={[styles.driverName, { color: theme.colors.text }]} numberOfLines={1}>
            {driver.name}
          </Text>
          <Text style={[styles.vehicleSub, { color: theme.colors.subtext }]}>
            {driver.vehicleModel} • {driver.plateNumber}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: theme.colors.primary + '18' }]}
          onPress={handleCallDriver}
        >
          <Text style={{ fontSize: 18 }}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT MESSAGES LIST */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* QUICK REPLIES BAR */}
        <View style={styles.quickRepliesContainer}>
          <FlatList
            horizontal
            data={QUICK_REPLIES}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.quickReplyPill,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
                onPress={() => handleSendMessage(item)}
              >
                <Text style={[styles.quickReplyText, { color: theme.colors.text }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* INPUT COMPOSER BAR */}
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.colors.background, color: theme.colors.text },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Write a message to driver..."
            placeholderTextColor={theme.colors.subtext}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.border,
              },
            ]}
            disabled={!inputText.trim()}
            onPress={() => handleSendMessage()}
          >
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    paddingRight: 4,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
  },
  vehicleSub: {
    fontSize: 12,
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 2,
  },
  customerMessageRow: {
    justifyContent: 'flex-end',
  },
  driverMessageRow: {
    justifyContent: 'flex-start',
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  customerBubble: {
    borderBottomRightRadius: 4,
  },
  driverBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  quickRepliesContainer: {
    paddingVertical: 8,
  },
  quickRepliesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReplyPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});