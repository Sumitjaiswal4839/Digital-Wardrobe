import React, { useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, RADIUS } from '../theme/theme';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
  Layers,
  FlipHorizontal,
} from 'lucide-react-native';

export default function DraggableOverlay({
  layer,
  isSelected,
  onSelect,
  onUpdateTransform,
  onDelete,
  onBringForward,
}) {
  const translateX = useSharedValue(layer.x || 0);
  const translateY = useSharedValue(layer.y || 0);
  const scale = useSharedValue(layer.scale || 1);
  const rotation = useSharedValue(layer.rotation || 0);

  // Saved offset values for gesture start snapshots
  const startX = useSharedValue(layer.x || 0);
  const startY = useSharedValue(layer.y || 0);
  const startScale = useSharedValue(layer.scale || 1);
  const startRotation = useSharedValue(layer.rotation || 0);

  // Sync shared values if layer props change externally (e.g. from buttons or loading look)
  useEffect(() => {
    translateX.value = layer.x || 0;
    translateY.value = layer.y || 0;
    scale.value = layer.scale || 1;
    rotation.value = layer.rotation || 0;
  }, [layer.id, layer.x, layer.y, layer.scale, layer.rotation]);

  const syncTransform = (newX, newY, newScale, newRotation) => {
    onUpdateTransform(layer.id, {
      x: newX,
      y: newY,
      scale: newScale,
      rotation: newRotation,
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onSelect)(layer.id);
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(syncTransform)(
        translateX.value,
        translateY.value,
        scale.value,
        rotation.value
      );
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(onSelect)(layer.id);
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      const nextScale = startScale.value * e.scale;
      scale.value = Math.min(Math.max(nextScale, 0.3), 3.0);
    })
    .onEnd(() => {
      runOnJS(syncTransform)(
        translateX.value,
        translateY.value,
        scale.value,
        rotation.value
      );
    });

  const rotateGesture = Gesture.Rotation()
    .onStart(() => {
      runOnJS(onSelect)(layer.id);
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      const radToDeg = (e.rotation * 180) / Math.PI;
      rotation.value = (startRotation.value + radToDeg) % 360;
    })
    .onEnd(() => {
      runOnJS(syncTransform)(
        translateX.value,
        translateY.value,
        scale.value,
        rotation.value
      );
    });

  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    rotateGesture
  );

  const handleRotateButton = () => {
    const newRotation = (rotation.value + 15) % 360;
    rotation.value = newRotation;
    onUpdateTransform(layer.id, { rotation: newRotation });
  };

  const handleZoomInButton = () => {
    const newScale = Math.min(scale.value + 0.1, 3.0);
    scale.value = newScale;
    onUpdateTransform(layer.id, { scale: newScale });
  };

  const handleZoomOutButton = () => {
    const newScale = Math.max(scale.value - 0.1, 0.3);
    scale.value = newScale;
    onUpdateTransform(layer.id, { scale: newScale });
  };

  const handleFlipButton = () => {
    onUpdateTransform(layer.id, { flipped: !layer.flipped });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { scaleX: layer.flipped ? -1 : 1 },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: layer.opacity !== undefined ? layer.opacity : 1,
    zIndex: layer.zIndex || 10,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.overlayContainer, animatedStyle]}>
        <View
          style={[styles.imageWrapper, isSelected && styles.selectedWrapper]}
        >
          <Image
            source={{ uri: layer.image_uri }}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Action Controls for Selected Outfit Overlay */}
          {isSelected && (
            <View style={styles.controlPanel}>
              <TouchableOpacity
                style={styles.ctrlBtn}
                onPress={handleRotateButton}
              >
                <RotateCw size={12} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctrlBtn}
                onPress={handleZoomInButton}
              >
                <ZoomIn size={12} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctrlBtn}
                onPress={handleZoomOutButton}
              >
                <ZoomOut size={12} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctrlBtn}
                onPress={handleFlipButton}
              >
                <FlipHorizontal size={12} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctrlBtn}
                onPress={() => onBringForward(layer.id)}
              >
                <Layers size={12} color={COLORS.accentCyan} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ctrlBtn, styles.deleteCtrl]}
                onPress={() => onDelete(layer.id)}
              >
                <Trash2 size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  selectedWrapper: {
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  controlPanel: {
    position: 'absolute',
    top: -38,
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 14, 20, 0.9)',
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  ctrlBtn: {
    padding: 6,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: RADIUS.full,
  },
  deleteCtrl: {
    backgroundColor: COLORS.danger,
  },
});
