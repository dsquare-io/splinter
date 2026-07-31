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
  /** @description ISO 4217 Currency Code */
  currency: string;
  /** Format: date-time */
  readonly createdAt: string;
}

export interface AggregatedOutstandingBalance {
  uid: string;
  /** @description ISO 4217 Currency Code */
  currency: string;
  /** Format: decimal */
  amount: string;
  readonly balances: SimpleOutstandingBalance[];
  balanceScope: BalanceScopeEnum;
  objectUid: string;
}

export interface AttachmentConfig {
  readonly maxFileSize: number;
  readonly allowedContentTypes: string[];
  readonly allowedExtensions: string[];
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

export type BalanceScopeEnum = 'friend' | 'group';

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

export interface CreateFileAttachment {
  /** Format: uri */
  file: string;
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

export interface Currency {
  uid: string;
  readonly urn: string;
  symbol?: string | null;
  readonly country: Country;
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
  /** @description ISO 4217 Currency Code */
  currency: string;
  /**
   * Format: decimal
   * @description The outstanding balance of current user in this expense document
   */
  readonly outstandingBalance: string;
  readonly expenses: ChildExpense[];
  readonly attachments: FileAttachment[];
  version?: number;
  readonly paidBy: SimpleUser;
  readonly isDeleted: boolean;
  readonly createdBy: SimpleUser;
}

export interface ExpenseChangeLog {
  changes?: string[];
  readonly activityUrn: string;
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

export interface FileAttachment {
  readonly uid: string;
  readonly urn: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  /** Format: uri */
  readonly url: string;
  /** Format: uri */
  readonly thumbnailUrl: string | null;
}

export interface ForgetPassword {
  /** Format: email */
  email: string;
}

export type Friend = SimpleUser & {
  /** Format: email */
  email?: string | null;
};
export type Group = SimpleGroup & {
  readonly createdBy: SimpleUser;
};
export type GroupOutstandingBalance = SimpleOutstandingBalance & {
  readonly user: string;
  readonly friend: string;
};

export interface MfaToken {
  token: string;
}

export interface NotFound {
  detail: string;
}

export interface Object_ {
  /** @description Unique identifier of object */
  readonly uid: string;
  /** @description Unique resource name of object */
  readonly urn: string;
  /** @description String representation of object */
  readonly value: string;
}

export type OutstandingBalance = SimpleOutstandingBalance & {
  readonly uid: string;
  /** Format: uuid */
  readonly groupUid: string;
  readonly friendUid: string;
};

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

export type PatchedGroup = SimpleGroup & {
  readonly createdBy: SimpleUser;
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
  /** @description ISO 4217 Currency Code */
  currency: string;
  readonly createdBy: SimpleUser;
  readonly sender: SimpleUser;
  readonly receiver: SimpleUser;
  readonly attachments: FileAttachment[];
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

export interface PushSubscription {
  /** Format: uuid */
  readonly uid: string;
  /** Format: uri */
  endpoint: string;
  p256dh: string;
  auth: string;
}

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

export interface SimpleGroup {
  readonly uid: string;
  readonly urn: string;
  name: string;
}

export interface SimpleOutstandingBalance {
  /** Format: decimal */
  amount: string;
  /** @description ISO 4217 Currency Code */
  currency: string;
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
  attachments?: string[];
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
  attachments?: string[];
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
  readonly outstandingBalances: OutstandingBalance[];
  readonly aggregatedOutstandingBalance: AggregatedOutstandingBalance[];
}

export interface VapidPublicKey {
  publicKey: string;
}
