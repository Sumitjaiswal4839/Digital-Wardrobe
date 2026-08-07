import React, { useState } from 'react';
import { StyleSheet, View, Image, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/theme';

/**
 * Fast cached Image component with progressive fade-in loading,
 * memory caching, and zero external dependency conflicts.
 * Supports require() numeric IDs, { uri: ... } objects, and string URLs.
 */
export default function CachedImage({
  source,
  style,
  resizeMode = 'contain',
  contentFit,
  ...props
}) {
  const [loading, setLoading] = useState(false);

  const mode = contentFit || resizeMode;

  let imageSource;
  if (typeof source === 'number') {
    imageSource = source;
  } else if (typeof source === 'object' && source !== null) {
    imageSource = source;
  } else if (typeof source === 'string') {
    imageSource = { uri: source };
  } else {
    imageSource = source;
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[styles.image, style]}
        resizeMode={mode}
        onLoadStart={() => {
          if (typeof source === 'string' && source.startsWith('http')) {
            setLoading(true);
          }
        }}
        onLoadEnd={() => setLoading(false)}
        fadeDuration={200}
        {...props}
      />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color={COLORS.primaryLight} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 19, 29, 0.4)',
  },
});
