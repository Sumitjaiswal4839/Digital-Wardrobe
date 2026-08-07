/**
 * Centralized Source of Truth for 3D Mannequin Avatars & Model Templates
 * Uses local bundled assets for 100% offline capability.
 */

export const MANNEQUIN_MODELS = {
  male: require('../../assets/male_3d_avatar.jpg'),
  female: require('../../assets/female_3d_avatar.jpg'),
};

export const MODEL_TEMPLATES = {
  male: [
    require('../../assets/male_3d_avatar.jpg'),
  ],
  female: [
    require('../../assets/female_3d_avatar.jpg'),
  ],
};

/**
 * Normalizes any image source input (numeric require() ID, uri object, or string URL)
 * into a valid React Native <Image source={...} /> prop.
 */
export const getImageSource = (sourceInput, fallbackGender = 'male') => {
  if (!sourceInput) {
    return MANNEQUIN_MODELS[fallbackGender] || MANNEQUIN_MODELS.male;
  }
  if (typeof sourceInput === 'number') {
    return sourceInput;
  }
  if (typeof sourceInput === 'string') {
    if (
      sourceInput.startsWith('http://') ||
      sourceInput.startsWith('https://') ||
      sourceInput.startsWith('file:') ||
      sourceInput.startsWith('content:') ||
      sourceInput.startsWith('data:')
    ) {
      return { uri: sourceInput };
    }
  }
  if (typeof sourceInput === 'object' && sourceInput.uri) {
    return sourceInput;
  }
  return MANNEQUIN_MODELS[fallbackGender] || MANNEQUIN_MODELS.male;
};
