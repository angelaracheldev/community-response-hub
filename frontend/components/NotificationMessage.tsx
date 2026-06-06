import React from 'react';
import { StyleSheet, Text } from 'react-native';

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

const styles = StyleSheet.create({
  message: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  messageBold: {
    color: '#111827',
    fontWeight: '500',
  },
  quoted: {
    fontWeight: '700',
    color: '#111827',
  },
});
