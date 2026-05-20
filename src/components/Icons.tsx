import type { CSSProperties } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowDownUp,
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Info,
  Lock,
  CircleArrowRight,
  Search,
  Settings,
  TrendingUp,
  Wallet,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

type IconCompatProps = LucideProps & {
  width?: number;
  height?: number;
  style?: CSSProperties;
  color?: string;
};

const icon = (Icon: LucideIcon, defaultSize = 16) =>
  function IconComponent(props: IconCompatProps) {
    const { width, height, size: sizeProp, style, color, ...rest } = props;
    const size = sizeProp ?? width ?? height ?? defaultSize;
    return <Icon size={size} style={style} color={color} aria-hidden="true" {...rest} />;
  };

export const CloseIcon = icon(X, 16);
export const CheckIcon = icon(Check, 14);
export const ArrowDownIcon = icon(ArrowDown, 14);
export const AlertIcon = icon(AlertCircle, 16);
export const InfoIcon = icon(Info, 16);
export const LockIcon = icon(Lock, 11);
export const ChevronDownIcon = icon(ChevronDown, 14);
export const SearchIcon = icon(Search, 14);
export const ChevronRightIcon = icon(ChevronRight, 14);
export const ChevronLeftIcon = icon(ChevronLeft, 14);
export const SwapToolbarIcon = icon(ArrowLeftRight, 18);
export const HistoryToolbarIcon = icon(History, 18);
export const SettingsToolbarIcon = icon(Settings, 18);
export const WalletIcon = icon(Wallet, 16);
export const PoweredIcon = icon(CircleArrowRight, 12);
export const TrendingUpIcon = icon(TrendingUp, 14);
export const ArrowDownUpIcon = icon(ArrowDownUp, 16);
