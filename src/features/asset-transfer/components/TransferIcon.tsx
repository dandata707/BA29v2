import React from 'react';
import { ArrowLeft, ArrowRight, ArrowLeftRight, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Package, Search, Plus, X, MapPin, User, Users, Clock, Bell, Download, Printer, Upload, ShieldCheck, Info, Filter, Paperclip, Trash2, AlertTriangle } from 'lucide-react';
const icons: Record<string, React.ElementType> = {
  arrow_back: ArrowLeft, arrow_forward: ArrowRight, swap_horiz: ArrowLeftRight,
  check: Check, check_circle: CheckCircle, task_alt: CheckCircle, verified: ShieldCheck,
  chevron_left: ChevronLeft, chevron_right: ChevronRight, expand_more: ChevronDown,
  first_page: ChevronsLeft, last_page: ChevronsRight, description: FileText, assignment: FileText,
  inventory_2: Package, devices: Package, laptop_mac: Package, search: Search, add: Plus, close: X,
  location_on: MapPin, person: User, group: Users, schedule: Clock, notifications: Bell,
  download: Download, print: Printer, upload_file: Upload, cloud_upload: Upload,
  admin_panel_settings: ShieldCheck, info: Info, filter_list: Filter, attach_file: Paperclip,
  delete: Trash2, warning: AlertTriangle, cancel: X,
};
export function TransferIcon({ name, className = '' }: { name: string; className?: string }) {
  const Icon = icons[name] || FileText;
  return <Icon aria-hidden="true" className={`inline-block w-[1em] h-[1em] shrink-0 ${className}`} />;
}
