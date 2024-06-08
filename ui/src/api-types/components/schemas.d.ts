export type AccessToken = {
    accessToken?: string;
    /** Format: date-time */
    expiresAt?: string;
};
export type Activity = {
    /** Format: uuid */
    uid: string;
    urn: string;
    user: components["schemas"]["SimpleUser"];
    group: components["schemas"]["SimpleGroup"];
    template: string;
    description: string;
    target: components["schemas"]["Object"];
    /** Format: date-time */
    createdAt?: string;
};
export type AggregatedOutstandingBalance = {
    currency: components["schemas"]["SimpleCurrency"];
    /** Format: decimal */
    amount: string;
    balances: readonly components["schemas"]["OutstandingBalance"][];
};
export type AuthTokenData = {
    accessToken?: string;
    refreshToken?: string;
    /** Format: date-time */
    expiresAt?: string;
};
export type AuthenticateUser = {
    username: string;
    password: string;
};
export type AvailableDevice = {
    type: string;
    name: string;
};
export type ChallengeMfaDeviceResponse = {
    message: string | null;
};
export type ChangePassword = {
    oldPassword?: string;
    password: string;
};
export type ChildExpense = {
    /** Format: uuid */
    uid: string;
    urn: string;
    /** Format: decimal */
    amount: string;
    description: string;
    shares: components["schemas"]["ExpenseShare"][];
};
export type Comment = {
    /** Format: uuid */
    uid: string;
    urn: string;
    user: components["schemas"]["SimpleUser"];
    content: string;
    /** Format: date-time */
    createdAt?: string;
};
export type Country = {
    uid: string;
    urn: string;
    name: string;
    flag: string;
};
export type CreateFriendship = {
    /** Format: email */
    email: string;
    name: string;
};
export type CreateGroupMembership = {
    user: string;
};
export type Currency = {
    uid: string;
    urn: string;
    symbol?: string | null;
    country: components["schemas"]["Country"];
};
export type Device = {
    id: number;
    type: string;
    name: string;
};
export type EmailVerification = {
    token: string;
};
export type EnableMfaDeviceRequest = {
    params?: {
        [key: string]: unknown;
    } | null;
};
export type EnableMfaDeviceResponse = {
    /** Format: uri */
    configUrl?: string | null;
};
export type Error = {
    message: string;
    /** @description Short code describing the error */
    code: string;
};
export type Expense = {
    /** Format: uuid */
    uid: string;
    urn: string;
    /** Format: date-time */
    datetime: string;
    description: string;
    /** Format: decimal */
    amount: string;
    currency: components["schemas"]["SimpleCurrency"];
    /**
     * Format: decimal
     * @description The outstanding balance of current user in this expense document
     */
    outstandingBalance?: string;
    expenses: readonly components["schemas"]["ChildExpense"][];
    paidBy?: components["schemas"]["SimpleUser"];
    createdBy?: components["schemas"]["SimpleUser"];
};
export type ExpenseOrPayment = components["schemas"]["ExpenseTyped"] | components["schemas"]["PaymentTyped"];
export type ExpenseShare = {
    user: string;
    /**
     * @description The share of the user in the expense
     * @default 1
     */
    share?: number;
    /**
     * Format: decimal
     * @description The amount of the user in the expense
     */
    amount: string;
};
export type ExpenseTyped = {
    type: string;
} & components["schemas"]["Expense"];
export type ExtendedGroup = {
    uid: string;
    urn: string;
    name: string;
    /** @description Outstanding balances for all group members */
    outstandingBalances?: readonly components["schemas"]["GroupOutstandingBalance"][];
    /** @description Aggregated outstanding balance for the current user */
    aggregatedOutstandingBalance?: components["schemas"]["AggregatedOutstandingBalance"];
    createdBy?: components["schemas"]["SimpleUser"];
    members: readonly components["schemas"]["SimpleUser"][];
};
export type ForgetPassword = {
    /** Format: email */
    email: string;
};
export type Friend = {
    uid: string;
    urn: string;
    fullName?: string;
    /** @description Indicates whether the user is active or not. */
    isActive?: boolean;
    /** @description Outstanding balances for current user. Only top 5 on list view */
    outstandingBalances?: readonly components["schemas"]["FriendOutstandingBalance"][];
    /** @description Aggregated outstanding balance for the current user */
    aggregatedOutstandingBalance?: components["schemas"]["AggregatedOutstandingBalance"];
};
export type FriendOutstandingBalance = {
    /** Format: decimal */
    amount: string;
    currency: components["schemas"]["SimpleCurrency"];
    group: components["schemas"]["SimpleGroup"];
    friend: components["schemas"]["SimpleUser"];
};
export type Group = {
    uid: string;
    urn: string;
    name: string;
    /** @description Top 5 Outstanding balances for current user */
    outstandingBalances?: readonly components["schemas"]["GroupOutstandingBalance"][];
    /** @description Aggregated outstanding balance for the current user */
    aggregatedOutstandingBalance?: components["schemas"]["AggregatedOutstandingBalance"];
};
export type GroupOutstandingBalance = {
    /** Format: decimal */
    amount: string;
    currency: components["schemas"]["SimpleCurrency"];
    user: components["schemas"]["SimpleUser"];
    friend: components["schemas"]["SimpleUser"];
};
export type MfaToken = {
    token: string;
};
export type NotFound = {
    detail: string;
};
export type Object = {
    /** @description Unique identifier of object */
    uid: string | null;
    /** @description Unique resource name of object */
    urn: string | null;
    /** @description String representation of object */
    value: string;
};
export type OutstandingBalance = {
    /** Format: decimal */
    amount: string;
    currency: components["schemas"]["SimpleCurrency"];
};
export type PaginatedActivityList = {
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
    results?: components["schemas"]["Activity"][];
};
export type PaginatedCommentList = {
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
    results?: components["schemas"]["Comment"][];
};
export type PaginatedExpenseOrPaymentList = {
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
    results?: components["schemas"]["ExpenseOrPayment"][];
};
export type PaginatedFriendList = {
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
    results?: components["schemas"]["Friend"][];
};
export type PaginatedGroupList = {
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
    results?: components["schemas"]["Group"][];
};
export type PatchedExtendedGroup = {
    uid?: string;
    urn?: string;
    name?: string;
    /** @description Outstanding balances for all group members */
    outstandingBalances?: readonly components["schemas"]["GroupOutstandingBalance"][];
    /** @description Aggregated outstanding balance for the current user */
    aggregatedOutstandingBalance?: components["schemas"]["AggregatedOutstandingBalance"];
    createdBy?: components["schemas"]["SimpleUser"];
    members?: readonly components["schemas"]["SimpleUser"][];
};
export type PatchedUser = {
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
};
export type Payment = {
    /** Format: uuid */
    uid: string;
    urn: string;
    /** Format: date-time */
    datetime: string;
    description: string;
    /** Format: decimal */
    amount: string;
    currency: components["schemas"]["SimpleCurrency"];
    createdBy?: components["schemas"]["SimpleUser"];
    sender: components["schemas"]["SimpleUser"];
    receiver: components["schemas"]["SimpleUser"];
};
export type PaymentTyped = {
    type: string;
} & components["schemas"]["Payment"];
export type RefreshAccessToken = {
    refreshToken?: string;
};
export type ResetPassword = {
    uid: string;
    token: string;
    password: string;
};
export type SimpleCurrency = {
    uid: string;
    urn: string;
    symbol?: string | null;
};
export type SimpleGroup = {
    uid: string;
    urn: string;
    name: string;
};
export type SimpleUser = {
    uid: string;
    urn: string;
    fullName?: string;
    /** @description Indicates whether the user is active or not. */
    isActive?: boolean;
};
export type UpdateGroupMembership = {
    members: string[];
};
export type UpsertExpense = {
    /** Format: date-time */
    datetime: string;
    description: string;
    /** @default CurrentUser */
    paidBy?: string;
    group?: string;
    /** @description ISO 4217 Currency Code */
    currency: string;
    expenses: components["schemas"]["ChildExpense"][];
};
export type UpsertPayment = {
    sender: string;
    receiver: string;
    /** Format: date-time */
    datetime: string;
    /** @default Payment */
    description?: string;
    group?: string;
    /** @description ISO 4217 Currency Code */
    currency: string;
    /** Format: decimal */
    amount: string;
};
export type User = {
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
};
export type UserCurrency = {
    /** @description ISO 4217 Currency Code */
    currency: string;
};
export type UserDeviceInfo = {
    availableDevices?: components["schemas"]["AvailableDevice"][];
    configuredDevices?: components["schemas"]["Device"][];
    authenticationMethods?: components["schemas"]["Device"][];
};
export type UserOutstandingBalance = {
    currency: components["schemas"]["SimpleCurrency"];
    /** Format: decimal */
    amount: string;
    paid: components["schemas"]["AggregatedOutstandingBalance"];
    borrowed: components["schemas"]["AggregatedOutstandingBalance"];
};
