export interface AccessToken {
  accessToken: string;
  /** Format: date-time */
  expiresAt: string;
}

export interface Activity {
  /** Format: uuid */
  readonly uid: string;
  readonly urn: string;
  readonly actor: SimpleUser;
  readonly group: SimpleGroup;
  readonly target: Object_;
  readonly object: Object_;
  readonly description: string;
  readonly verb: string;
  readonly template: string;
  readonly isRead: boolean;
  /** Format: decimal */
  outstandingBalance?: string | null;
  readonly currency: SimpleCurrency;
  /** Format: date-time */
  readonly createdAt: string;
}

export interface AggregatedOutstandingBalance {
  readonly currency: SimpleCurrency;
  /** Format: decimal */
  amount: string;
  readonly balances: OutstandingBalance[];
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  /** Format: date-time */
  expiresAt: string;
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
  oldPassword: string;
  password: string;
}

export interface ChildExpense {
  /** Format: uuid */
  readonly uid: string;
  readonly urn: string;
  /** Format: decimal */
  amount: string;
  description: string;
  shares: ExpenseShare[];
}

export interface Comment {
  /** Format: uuid */
  readonly uid: string;
  readonly urn: string;
  readonly user: SimpleUser;
  content: string;
  /** Format: date-time */
  readonly createdAt: string;
}

export interface Country {
  uid: string;
  readonly urn: string;
  name: string;
  flag: string;
}

export type CreateFriendship = CreateUser;

export interface CreateGroup {
  name: string;
  members: string[];
}

export interface CreateGroupMembership {
  user: string;
}

export interface CreateUser {
  /** Format: email */
  email: string;
  name: string;
}

export type Currency = SimpleCurrency & {
  readonly country: Country;
};

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
  configUrl: string | null;
}

export interface Error {
  message: string;
  /** @description Short code describing the error */
  code: string;
}

export interface Expense {
  /** Format: uuid */
  readonly uid: string;
  readonly urn: string;
  /** Format: date-time */
  datetime: string;
  description: string;
  /** Format: decimal */
  amount: string;
  group: string;
  currency: SimpleCurrency;
  /**
   * Format: decimal
   * @description The outstanding balance of current user in this expense document
   */
  readonly outstandingBalance: string;
  readonly expenses: ChildExpense[];
  version?: number;
  readonly paidBy: SimpleUser;
  readonly isDeleted: boolean;
  readonly createdBy: SimpleUser;
}

export interface ExpenseChangeLog {
  changes?: string[];
  readonly activityId: string;
  readonly references: Object_[];
}

export type ExpenseOrPayment = ExpenseTyped | PaymentTyped;
export type ExpenseOrPaymentOrSettlement = ExpenseTyped | PaymentTyped | SettlementTyped;

export interface ExpenseShare {
  user: string;
  readonly userProfile: SimpleUser;
  /**
   * @description The share of the user in the expense
   * @default 1
   */
  share: number;
  /**
   * Format: decimal
   * @description The amount of the user in the expense
   */
  readonly amount: string;
}

export type ExpenseTyped = {
  type: ExpenseTypedTypeEnum;
} & Expense & {
    /**
     * @description discriminator enum property added by openapi-typescript
     * @enum {string}
     */
    type: 'expense';
  };
export type ExpenseTypedTypeEnum = 'expense';
export type ExtendedGroup = SimpleGroup & {
  /** @description Outstanding balances for all group members */
  readonly outstandingBalances: GroupOutstandingBalance[];
  /** @description Aggregated outstanding balance for the current user */
  readonly aggregatedOutstandingBalance: AggregatedOutstandingBalance;
  readonly createdBy: SimpleUser;
  readonly members: SimpleUser[];
};

export interface ForgetPassword {
  /** Format: email */
  email: string;
}

export type Friend = SimpleUser & {
  /** Format: email */
  email?: string | null;
  /** @description Outstanding balances for current user. Only top 5 on list view */
  readonly outstandingBalances: FriendOutstandingBalance[];
  /** @description Aggregated outstanding balance for the current user */
  readonly aggregatedOutstandingBalance: AggregatedOutstandingBalance;
};
export type FriendOutstandingBalance = OutstandingBalance & {
  readonly group: SimpleGroup;
  readonly friend: SimpleUser;
};
export type Group = SimpleGroup & {
  /** @description Top 5 Outstanding balances for current user */
  readonly outstandingBalances: GroupOutstandingBalance[];
  /** @description Aggregated outstanding balance for the current user */
  readonly aggregatedOutstandingBalance: AggregatedOutstandingBalance;
};
export type GroupOutstandingBalance = OutstandingBalance & {
  readonly user: SimpleUser;
  readonly friend: SimpleUser;
};

export interface MfaToken {
  token: string;
}

export interface NotFound {
  detail: string;
}

export interface Object_ {
  /** @description Unique identifier of object */
  readonly uid: string | null;
  /** @description Unique resource name of object */
  readonly urn: string | null;
  /** @description String representation of object */
  readonly value: string;
}

export interface OutstandingBalance {
  /** Format: decimal */
  amount: string;
  readonly currency: SimpleCurrency;
}

export interface PaginatedActivityList {
  nextCursor?: string | null;
  previousCursor?: string | null;
  results: Activity[];
}

export interface PaginatedExpenseOrPaymentOrSettlementList {
  nextCursor?: string | null;
  previousCursor?: string | null;
  results: ExpenseOrPaymentOrSettlement[];
}

export type PatchedExtendedGroup = SimpleGroup & {
  /** @description Outstanding balances for all group members */
  readonly outstandingBalances: GroupOutstandingBalance[];
  /** @description Aggregated outstanding balance for the current user */
  readonly aggregatedOutstandingBalance: AggregatedOutstandingBalance;
  readonly createdBy: SimpleUser;
  readonly members: SimpleUser[];
};
export type PatchedUser = SimpleUser & {
  firstName?: string;
  lastName?: string;
  /** Format: email */
  email?: string | null;
  readonly isVerified: boolean;
};

export interface Payment {
  /** Format: uuid */
  readonly uid: string;
  readonly urn: string;
  /** Format: date-time */
  datetime: string;
  description: string;
  /** Format: decimal */
  amount: string;
  group: string;
  currency: SimpleCurrency;
  readonly createdBy: SimpleUser;
  readonly sender: SimpleUser;
  readonly receiver: SimpleUser;
  readonly isDeleted: boolean;
}

export type PaymentTyped = {
  type: PaymentTypedTypeEnum;
} & Payment & {
    /**
     * @description discriminator enum property added by openapi-typescript
     * @enum {string}
     */
    type: 'payment';
  };
export type PaymentTypedTypeEnum = 'payment';

export interface RefreshAccessToken {
  refreshToken: string;
}

export interface ResetPassword {
  uid: string;
  token: string;
  password: string;
}

export interface Settlement {
  /** Format: uuid */
  readonly uid: string;
  /** Format: date-time */
  readonly createdAt: string;
}

export type SettlementTyped = {
  type: SettlementTypedTypeEnum;
} & Settlement & {
    /**
     * @description discriminator enum property added by openapi-typescript
     * @enum {string}
     */
    type: 'settlement';
  };
export type SettlementTypedTypeEnum = 'settlement';

export interface SimpleCurrency {
  uid: string;
  readonly urn: string;
  symbol?: string | null;
}

export interface SimpleGroup {
  readonly uid: string;
  readonly urn: string;
  name: string;
}

export interface SimpleUser {
  uid: string;
  readonly urn: string;
  readonly name: string;
  /** @description Indicates whether the user is active or not. */
  readonly isActive: boolean;
}

export interface UpsertExpense {
  /** Format: date-time */
  datetime: string;
  description?: string;
  /** @default 0 */
  version: number;
  /** @default CurrentUser */
  paidBy: string;
  group?: string;
  /** @description ISO 4217 Currency Code */
  currency: string;
  expenses: ChildExpense[];
}

export interface UpsertPayment {
  sender: string;
  receiver: string;
  /** Format: date-time */
  datetime: string;
  description?: string;
  group?: string;
  /** @description ISO 4217 Currency Code */
  currency: string;
  /** Format: decimal */
  amount: string;
}

export type User = SimpleUser & {
  firstName?: string;
  lastName?: string;
  /** Format: email */
  email?: string | null;
  readonly isVerified: boolean;
};

export interface UserCurrency {
  /** @description ISO 4217 Currency Code */
  currency: string;
}

export interface UserDeviceInfo {
  availableDevices: AvailableDevice[];
  configuredDevices: Device[];
  authenticationMethods: Device[];
}

export interface UserOutstandingBalance {
  readonly currency: SimpleCurrency;
  /** Format: decimal */
  amount: string;
  readonly paid: AggregatedOutstandingBalance;
  readonly borrowed: AggregatedOutstandingBalance;
}
