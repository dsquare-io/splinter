export interface AuthenticateUser {
  /** Format: email */
  email: string;
  password: string;
}

export interface AuthenticateUserBadRequest {
  email: string[];
  password: string[];
}

export interface AvailableDevice {
  type: string;
  name: string;
}

export interface BulkCreateGroupMembership {
  group: string;
  members: string[];
}

export interface ChallengeMfaDeviceResponse {
  message: string | null;
}

export interface ChangePassword {
  oldPassword?: string;
  password: string;
}

export interface ChangePasswordBadRequest {
  oldPassword?: string[];
  password: string[];
}

export interface ConfirmMfaDeviceBadRequest {
  token: string[];
}

export interface Country {
  name: string;
  flag: string;
}

export interface CreateGroupBadRequest {
  outstandingBalances?: string[];
  membersOutstandingBalances?: string[];
}

export interface CreateGroupMembershipBadRequest {
  group: string[];
  members: string[];
}

export interface Currency {
  isoCode?: string;
  symbol?: string | null;
  country: Country;
}

export interface Device {
  id: number;
  type: string;
  name: string;
}

export interface EmailVerification {
  token: string;
}

export interface EmailVerificationBadRequest {
  token: string[];
}

export interface EnableMfaDeviceBadRequest {
  params: string[];
}

export interface EnableMfaDeviceRequest {
  params?: {
    [key: string]: unknown;
  } | null;
}

export interface EnableMfaDeviceResponse {
  /** Format: uri */
  configUrl?: string | null;
}

export interface ForgetPassword {
  /** Format: email */
  email: string;
}

export interface ForgetPasswordBadRequest {
  email: string[];
}

export interface Friend {
  uid: string;
  name: string;
  invitationAccepted?: boolean;
}

export interface FriendOutstandingBalance {
  group: {
    [key: string]: string;
  };
  nonGroup?: {
    [key: string]: string;
  };
}

export interface FriendWithOutstandingBalance {
  uid: string;
  name: string;
  invitationAccepted?: boolean;
  outstandingBalances?: FriendOutstandingBalance;
  aggregatedOutstandingBalances?: {
    [key: string]: string;
  };
}

export interface GroupDetail {
  name: string;
  /** Format: uuid */
  publicId?: string;
  createdBy?: Friend;
  members: readonly Friend[];
}

export interface GroupMemberOutstandingBalance {
  friend: Friend;
  /** Format: decimal */
  amount: string;
}

export interface GroupWithOutstandingBalance {
  name: string;
  /** Format: uuid */
  publicId?: string;
  outstandingBalances?: {
    [key: string]: string;
  };
  membersOutstandingBalances?: {
    [key: string]: GroupMemberOutstandingBalance[];
  };
}

export interface InviteFiendBadRequest {
  email: string[];
  name: string[];
}

export interface InviteFriend {
  /** Format: email */
  email: string;
  name: string;
}

export interface MfaToken {
  token: string;
}

export interface NotFoundError {
  detail: string;
}

export interface PaginatedFriendWithOutstandingBalanceList {
  /** @example 123 */
  count?: number;
  /**
   * Format: uri
   * @example http://api.example.org/accounts/?offset=400&limit=100
   */
  next?: string | null;
  /**
   * Format: uri
   * @example http://api.example.org/accounts/?offset=200&limit=100
   */
  previous?: string | null;
  results?: FriendWithOutstandingBalance[];
}

export interface PaginatedGroupWithOutstandingBalanceList {
  /** @example 123 */
  count?: number;
  /**
   * Format: uri
   * @example http://api.example.org/accounts/?offset=400&limit=100
   */
  next?: string | null;
  /**
   * Format: uri
   * @example http://api.example.org/accounts/?offset=200&limit=100
   */
  previous?: string | null;
  results?: GroupWithOutstandingBalance[];
}

export interface PartialUpdateGroupBadRequest {
  createdBy?: string[];
  members: string[];
}

export interface PartialUpdateUserProfileBadRequest {
  displayName?: string[];
}

export interface PatchedGroupDetail {
  name?: string;
  /** Format: uuid */
  publicId?: string;
  createdBy?: Friend;
  members?: readonly Friend[];
}

export interface PatchedUserProfile {
  /** @description Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  /** Format: email */
  email?: string | null;
  isVerified?: boolean;
}

export interface ResetPassword {
  uid: string;
  token: string;
  password: string;
}

export interface ResetPasswordBadRequest {
  uid: string[];
  token: string[];
  password: string[];
}

export interface UnauthorizedError {
  detail: string;
}

export interface UpdateGroupBadRequest {
  createdBy?: string[];
  members: string[];
}

export interface UpdateUserProfileBadRequest {
  displayName?: string[];
}

export interface UserDeviceInfo {
  availableDevices?: AvailableDevice[];
  configuredDevices?: Device[];
  authenticationMethods?: Device[];
}

export interface UserProfile {
  /** @description Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  /** Format: email */
  email?: string | null;
  isVerified?: boolean;
}

export interface VerifyMfaDeviceBadRequest {
  token: string[];
}

