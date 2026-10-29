import { HandoverProtocol, UserProfile } from '../types';

export function canEditHandover(protocol: HandoverProtocol | null | undefined, user: UserProfile) {
  return user.role === 'asset_manager' && (!protocol || protocol.status === 'Nháp');
}

export function canSignHandover(protocol: HandoverProtocol | null | undefined, user: UserProfile) {
  return user.role === 'employee' && protocol?.status === 'Chờ ký' &&
    (protocol.receiverCode === user.code || protocol.receiverName === user.name);
}

export function confirmHandover(protocol: HandoverProtocol | null | undefined, user: UserProfile, passwordConfirmed: boolean, signedAt = new Date().toISOString()): HandoverProtocol | null {
  if (!protocol || !passwordConfirmed || !canSignHandover(protocol, user)) return null;
  return { ...protocol, status: 'Hoàn tất', signedByReceiver: true, receiverSignDate: signedAt };
}
