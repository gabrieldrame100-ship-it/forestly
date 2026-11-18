import Svg, { Circle, Path, Rect } from 'react-native-svg';

type Props = { color: string; size?: number };

export default function MushroomIllustration({ color, size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="40" y="48" width="20" height="38" rx="9" fill="#FFFFFF" />
      <Path d="M8 54 C8 30 27 14 50 14 C73 14 92 30 92 54 Z" fill={color} />
      <Rect x="8" y="52" width="84" height="7" rx="3.5" fill={color} opacity={0.65} />
      <Circle cx="32" cy="34" r="5" fill="#FFFFFF" opacity={0.55} />
      <Circle cx="54" cy="27" r="4" fill="#FFFFFF" opacity={0.55} />
      <Circle cx="70" cy="40" r="5" fill="#FFFFFF" opacity={0.55} />
    </Svg>
  );
}