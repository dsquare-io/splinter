export interface AccessToken {
  accessToken?: string;
  /** Format: date-time */
  expiresAt?: string;
}

export interface Activity {
  /** Format: uuid */
  uid: string;
  urn: string;
  user: User;
  group: Group;
  template: string;
  description: string;
  target: Target;
  /** Format: date-time */
  createdAt?: string;
}

export interface AuthTokenData {
  accessToken?: string;
  refreshToken?: string;
  /** Format: date-time */
  expiresAt?: string;
}

export interface AuthenticateUser {
  username: string;
  password: string;
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

export interface Comment {
  /** Format: uuid */
  uid: string;
  urn: string;
  user: User;
  content: string;
  /** Format: date-time */
  createdAt?: string;
}

export interface Country {
  uid: string;
  urn: string;
  name: string;
  flag: string;
}

export interface CreateFriendship {
  /** Format: email */
  email: string;
  name: string;
}

export interface Currency {
  uid: string;
  urn: string;
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

export interface EnableMfaDeviceRequest {
  params?: {
    [key: string]: unknown;
  } | null;
}

export interface EnableMfaDeviceResponse {
  /** Format: uri */
  configUrl?: string | null;
}

export interface Error {
  message: string;
  /** @description Short code describing the error */
  code: string;
}

export interface ForgetPassword {
  /** Format: email */
  email: string;
}

export interface FriendOutstandingBalance {
  /**
   * @example {
   *   "USD": "100.00"
   * }
   */
  group: {
    [key: string]: string;
  };
  /**
   * @example {
   *   "USD": "100.00"
   * }
   */
  nonGroup?: {
    [key: string]: string;
  };
}

export interface FriendWithOutstandingBalance {
  uid: string;
  urn: string;
  fullName?: string;
  /** @description Indicates whether the user is active or not. */
  isActive?: boolean;
  outstandingBalances?: FriendOutstandingBalance;
  /**
   * @example {
   *   "USD": "100.00"
   * }
   */
  aggregatedOutstandingBalances?: {
    [key: string]: string;
  };
}

export interface Group {
  uid: string;
  urn: string;
  name: string;
}

export interface GroupDetail {
  uid: string;
  urn: string;
  name: string;
  createdBy?: User;
  members: readonly User[];
}

export interface GroupFriendOutstandingBalance {
  friend: User;
  /** Format: decimal */
  amount: string;
  /** @description ISO 4217 Currency Code */
  currency: string;
}

export interface GroupWithOutstandingBalance {
  uid: string;
  urn: string;
  name: string;
  outstandingBalances?: readonly GroupFriendOutstandingBalance[];
  /**
   * @example {
   *   "USD": "100.00"
   * }
   */
  aggregatedOutstandingBalances?: {
    [key: string]: string;
  };
}

export interface MfaToken {
  token: string;
}

export interface NotFound {
  detail: string;
}

export interface PaginatedActivityList {
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
  results?: Activity[];
}

export interface PaginatedCommentList {
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
  results?: Comment[];
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

export interface PatchedGroupDetail {
  uid?: string;
  urn?: string;
  name?: string;
  createdBy?: User;
  members?: readonly User[];
}

export interface PatchedUserProfile {
  uid?: string;
  urn?: string;
  fullName?: string;
  /** @description Indicates whether the user is active or not. */
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  /** Format: email */
  email?: string | null;
  isVerified?: boolean;
}

export interface RefreshAccessToken {
  refreshToken?: string;
}

export interface ResetPassword {
  uid: string;
  token: string;
  password: string;
}

export interface Target {
  /** @description Unique identifier of the target object */
  uid: string;
  urn: string;
  /** @description Type of the target object */
  type: string;
  /** @description String representation of the target object */
  value: string;
}

export interface User {
  uid: string;
  urn: string;
  fullName?: string;
  /** @description Indicates whether the user is active or not. */
  isActive?: boolean;
}

export interface UserDeviceInfo {
  availableDevices?: AvailableDevice[];
  configuredDevices?: Device[];
  authenticationMethods?: Device[];
}

export interface UserProfile {
  uid: string;
  urn: string;
  fullName?: string;
  /** @description Indicates whether the user is active or not. */
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  /** Format: email */
  email?: string | null;
  isVerified?: boolean;
}

