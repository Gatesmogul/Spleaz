import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

interface ChatMessage {
  id: string;
  sender: 'DRIVER' | 'RIDER';
  text: string;
  timestamp: string;
}

interface RiderProfile {
  name: string;
  phone: string;
  photoUrl: string;
  rating: number;
  pickupLocation: string;
}

// Driver-specific canned quick replies for fast communication while driving safely
const DRIVER_QUICK_REPLIES = [
  "I've arrived at the pickup location 📍",
  "Heavy traffic, arriving in ~5 mins 🚦",
  "I am waiting near the main gate 🚗",
  "Please let me know when you are outside 👍",
];

export default function DriverRiderChatScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');

  // Rider details
  const rider: RiderProfile = {
    name: 'Oluwaseun Vance',
    phone: '+2348021234567',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    rating: 4.95,
    pickupLocation: 'Admiralty Way, Lekki Phase 1',
  };

  // Chat message history state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'RIDER',
      text: 'Hello driver! Please let me know when you arrive.',
      timestamp: '10:40 AM',
    },
    {
      id: '2',
      sender: 'DRIVER',
      text: 'I am on my way, currently 3 minutes away.',
      timestamp: '10:41 AM',
    },
    {
      id: '3',
      sender: 'RIDER',
      text: 'Okay, I will be standing near the security post.',
      timestamp: '10:41 AM',
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
      sender: 'DRIVER',
      text: content,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (!textToSend) setInputText('');

    // Simulate Rider automated response after 2 seconds
    setTimeout(() => {
      const riderReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'RIDER',
        text: 'Got it, coming out now!',
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, riderReply]);
    }, 2000);
  };

  const handleCallRider = () => {
    Linking.openURL(`tel:${rider.phone}`).catch(() =>
      Alert.alert('Error', 'Unable to initiate call from this device.')
    );
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isDriver = item.sender === 'DRIVER';

    return (
      <View
        style={[
          styles.messageRow,
          isDriver ? styles.driverMessageRow : styles.riderMessageRow,
        ]}
      >
        {!isDriver && (
          <Image source={{ uri: rider.photoUrl }} style={styles.chatAvatar} />
        )}

        <View
          style={[
            styles.messageBubble,
            isDriver
              ? [styles.driverBubble, { backgroundColor: theme.colors.primary }]
              : [styles.riderBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isDriver ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestampText,
              { color: isDriver ? 'rgba(255,255,255,0.7)' : theme.colors.subtext },
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

        <Image source={{ uri: rider.photoUrl }} style={styles.headerAvatar} />

        <View style={styles.headerInfo}>
          <View style={styles.riderNameRow}>
            <Text style={[styles.riderName, { color: theme.colors.text }]} numberOfLines={1}>
              {rider.name}
            </Text>
            <Text style={styles.ratingText}>★ {rider.rating.toFixed(1)}</Text>
          </View>
          <Text style={[styles.pickupSub, { color: theme.colors.subtext }]} numberOfLines={1}>
            📍 {rider.pickupLocation}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: theme.colors.primary + '18' }]}
          onPress={handleCallRider}
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

        {/* QUICK REPLIES BAR (SAFE DRIVING TEMPLATES) */}
        <View style={styles.quickRepliesContainer}>
          <FlatList
            horizontal
            data={DRIVER_QUICK_REPLIES}
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
            placeholder="Write a message to passenger..."
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
  riderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '800',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFB300',
  },
  pickupSub: {
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
  driverMessageRow: {
    justifyContent: 'flex-end',
  },
  riderMessageRow: {
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
  driverBubble: {
    borderBottomRightRadius: 4,
  },
  riderBubble: {
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
