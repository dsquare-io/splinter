export interface AccessToken {
  accessToken?: string;
  /** Format: date-time */
  expiresAt?: string;
}

export interface Activity {
  /** Format: uuid */
  uid: string;
  urn: string;
  user: SimpleUser;
  group: SimpleGroup;
  template: string;
  description: string;
  target: Object;
  /** Format: date-time */
  createdAt?: string;
}

export interface AggregatedOutstandingBalance {
  currency: SimpleCurrency;
  /** Format: decimal */
  amount: string;
  balances: readonly OutstandingBalance[];
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
  user: SimpleUser;
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

export interface CreateGroupMembership {
  user: string;
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

export interface Expense {
  /** Format: uuid */
  uid: string;
  urn: string;
  /** Format: date-time */
  datetime: string;
  description: string;
  /** Format: decimal */
  amount: string;
  currency: SimpleCurrency;
  /**
   * Format: decimal
   * @description The outstanding balance of current user in this expense document
   */
  outstandingBalance?: string;
  expenses: readonly ExpenseRow[];
  paidBy?: SimpleUser;
  createdBy?: SimpleUser;
}

export interface ExpenseRow {
  /** Format: decimal */
  amount: string;
  description: string;
  shares: ExpenseShare[];
}

export interface ExpenseShare {
  user: string;
  /** @description The share of the user in the expense */
  share?: number;
  /**
   * Format: decimal
   * @description The amount of the user in the expense
   */
  amount: string;
}

export interface ExtendedGroup {
  uid: string;
  urn: string;
  name: string;
  /** @description Outstanding balances for all group members */
  outstandingBalances?: readonly GroupOutstandingBalance[];
  /** @description Aggregated outstanding balance for the current user */
  aggregatedOutstandingBalance?: AggregatedOutstandingBalance;
  createdBy?: SimpleUser;
  members: readonly SimpleUser[];
}

export interface ForgetPassword {
  /** Format: email */
  email: string;
}

export interface Friend {
  uid: string;
  urn: string;
  fullName?: string;
  /** @description Indicates whether the user is active or not. */
  isActive?: boolean;
  /** @description Outstanding balances for current user. Only top 5 on list view */
  outstandingBalances?: readonly FriendOutstandingBalance[];
  /** @description Aggregated outstanding balance for the current user */
  aggregatedOutstandingBalance?: AggregatedOutstandingBalance;
}

export interface FriendOutstandingBalance {
  /** Format: decimal */
  amount: string;
  currency: SimpleCurrency;
  group: SimpleGroup;
  friend: SimpleUser;
}

export interface Group {
  uid: string;
  urn: string;
  name: string;
  /** @description Top 5 Outstanding balances for current user */
  outstandingBalances?: readonly GroupOutstandingBalance[];
  /** @description Aggregated outstanding balance for the current user */
  aggregatedOutstandingBalance?: AggregatedOutstandingBalance;
}

export interface GroupOutstandingBalance {
  /** Format: decimal */
  amount: string;
  currency: SimpleCurrency;
  user: SimpleUser;
  friend: SimpleUser;
}

export interface MfaToken {
  token: string;
}

export interface NotFound {
  detail: string;
}

export interface Object {
  /** @description Unique identifier of object */
  uid: string | null;
  /** @description Unique resource name of object */
  urn: string | null;
  /** @description String representation of object */
  value: string;
}

export interface OutstandingBalance {
  /** Format: decimal */
  amount: string;
  currency: SimpleCurrency;
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

export interface PaginatedExpenseList {
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
  results?: Expense[];
}

export interface PaginatedFriendList {
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
  results?: Friend[];
}

export interface PaginatedGroupList {
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
  results?: Group[];
}

export interface PatchedExtendedGroup {
  uid?: string;
  urn?: string;
  name?: string;
  /** @description Outstanding balances for all group members */
  outstandingBalances?: readonly GroupOutstandingBalance[];
  /** @description Aggregated outstanding balance for the current user */
  aggregatedOutstandingBalance?: AggregatedOutstandingBalance;
  createdBy?: SimpleUser;
  members?: readonly SimpleUser[];
}

export interface PatchedUser {
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

export interface SimpleCurrency {
  uid: string;
  urn: string;
  symbol?: string | null;
}

export interface SimpleGroup {
  uid: string;
  urn: string;
  name: string;
}

export interface SimpleUser {
  uid: string;
  urn: string;
  fullName?: string;
  /** @description Indicates whether the user is active or not. */
  isActive?: boolean;
}

export interface UpdateGroupMembership {
  members: string[];
}

export interface UpsertExpense {
  /** Format: date-time */
  datetime: string;
  description: string;
  paidBy?: string;
  group?: string;
  /** @description ISO 4217 Currency Code */
  currency: string;
  expenses: ExpenseRow[];
}

export interface User {
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

export interface UserCurrency {
  /** @description ISO 4217 Currency Code */
  currency: string;
}

export interface UserDeviceInfo {
  availableDevices?: AvailableDevice[];
  configuredDevices?: Device[];
  authenticationMethods?: Device[];
}

export interface UserOutstandingBalance {
  currency: SimpleCurrency;
  /** Format: decimal */
  amount: string;
  paid: AggregatedOutstandingBalance;
  borrowed: AggregatedOutstandingBalance;
}
