import React from 'react';
import { Text } from 'react-native';
import { notificationMessageStyles as styles } from '../styles/notifications/message';

type Props = {
  message: string;
  bold?: boolean;
};

export function NotificationMessage({ message, bold = false }: Props) {
  const regex = /(['"])([^'"]+)\1/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(message)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Text key={key++}>{message.slice(lastIndex, match.index)}</Text>);
    }
    parts.push(
      <Text key={key++} style={styles.quoted}>
        {match[1]}
        {match[2]}
        {match[1]}
      </Text>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < message.length) {
    parts.push(<Text key={key++}>{message.slice(lastIndex)}</Text>);
  }

  if (parts.length === 0) {
    return <Text style={[styles.message, bold && styles.messageBold]}>{message}</Text>;
  }

  return <Text style={[styles.message, bold && styles.messageBold]}>{parts}</Text>;
}


