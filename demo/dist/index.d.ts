import { Express } from 'express';

/**
 * Payment link status
 */
type PaymentLinkStatus = 'active' | 'disabled' | 'expired';
/**
 * Payment verification status
 */
type PaymentStatus = 'not_found' | 'pending' | 'confirmed' | 'failed' | 'underpaid';
/**
 * Subscription interval
 */
type SubscriptionInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
/**
 * Subscription status
 */
type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'paused' | 'expired';
/**
 * Chain type
 */
type ChainType = 'evm' | 'solana';
/**
 * Supported chain configuration
 */
interface ChainConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    symbol: string;
    confirmations?: number;
    /** Chain type (default: 'evm') */
    type?: ChainType;
}
/**
 * Solana chain IDs
 * 101 = Mainnet, 102 = Devnet, 103 = Testnet
 */
declare const SOLANA_CHAIN_IDS: {
    readonly MAINNET: 101;
    readonly DEVNET: 102;
    readonly TESTNET: 103;
};
/**
 * Price configuration (single currency - legacy)
 */
interface Price {
    amount: string;
    tokenSymbol: string;
    chainId: number;
}
/**
 * Payment option for multi-currency support
 */
interface PaymentOption {
    /** Token symbol (e.g., ETH, SOL, USDC) */
    tokenSymbol: string;
    /** Chain ID where payment is accepted */
    chainId: number;
    /** Amount in this token */
    amount: string;
    /** Recipient address for this payment option (optional, uses default if not set) */
    recipientAddress?: string;
}
/**
 * Multi-currency price configuration
 */
interface MultiPrice {
    /** Default/primary price (used for display) */
    primary: Price;
    /** Additional accepted payment options */
    options: PaymentOption[];
}
/**
 * Payment link entity
 */
interface PaymentLink {
    id: string;
    targetUrl: string;
    /** Primary price (for backward compatibility) */
    price: Price;
    /** Additional payment options for multi-currency */
    paymentOptions?: PaymentOption[];
    /** Default recipient address */
    recipientAddress: string;
    status: PaymentLinkStatus;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
    maxUses?: number;
    usedCount?: number;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
    /** Subscription configuration */
    subscription?: SubscriptionConfig;
}
/**
 * Subscription configuration for a payment link
 */
interface SubscriptionConfig {
    /** Billing interval */
    interval: SubscriptionInterval;
    /** Number of intervals between billings (default: 1) */
    intervalCount?: number;
    /** Grace period in hours after due date before marking as past_due (default: 24) */
    gracePeriodHours?: number;
    /** Maximum number of billing cycles (undefined = unlimited) */
    maxCycles?: number;
    /** Trial period in days (0 = no trial) */
    trialDays?: number;
}
/**
 * Subscription entity
 */
interface Subscription {
    id: string;
    paymentLinkId: string;
    subscriberAddress: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    nextPaymentDue: Date;
    cycleCount: number;
    lastPaymentId?: string;
    createdAt: Date;
    updatedAt: Date;
    cancelledAt?: Date;
    pausedAt?: Date;
    trialEndsAt?: Date;
    metadata?: Record<string, unknown>;
}
/**
 * Payment record
 */
interface Payment {
    id: string;
    paymentLinkId: string;
    chainId: number;
    txHash: string;
    fromAddress: string;
    /** Amount paid */
    amount: string;
    /** Token symbol used for payment */
    tokenSymbol?: string;
    confirmed: boolean;
    createdAt: Date;
    confirmedAt?: Date;
}
/**
 * Input for creating a payment link
 */
interface CreatePaymentLinkInput {
    targetUrl: string;
    /** Primary price */
    price: Price;
    /** Additional payment options for multi-currency */
    paymentOptions?: PaymentOption[];
    /** Default recipient address */
    recipientAddress: string;
    description?: string;
    maxUses?: number;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
    /** Subscription configuration (if set, creates a subscription link) */
    subscription?: SubscriptionConfig;
}
/**
 * Input for creating a subscription
 */
interface CreateSubscriptionInput {
    paymentLinkId: string;
    subscriberAddress: string;
    metadata?: Record<string, unknown>;
}
/**
 * 402 Protocol response
 */
interface Protocol402Response {
    protocol: '402-payportal-v1';
    paymentLinkId: string;
    resource: {
        description?: string;
        preview?: string | null;
    };
    /** Primary payment option */
    payment: {
        chainId: number;
        tokenSymbol: string;
        amount: string;
        recipient: string;
        timeoutSeconds: number;
    };
    /** Additional payment options (multi-currency) */
    paymentOptions?: Array<{
        chainId: number;
        tokenSymbol: string;
        amount: string;
        recipient: string;
    }>;
    callbacks: {
        status: string;
        confirm: string;
    };
    nonce: string;
    signature?: string;
    /** Subscription info (if this is a subscription link) */
    subscription?: {
        interval: SubscriptionInterval;
        intervalCount: number;
        trialDays?: number;
        /** Existing subscription ID if subscriber already has one */
        existingSubscriptionId?: string;
        /** Current subscription status */
        subscriptionStatus?: SubscriptionStatus;
        /** Next payment due date */
        nextPaymentDue?: string;
    };
}
/**
 * 403 Reason codes
 */
declare enum ReasonCode {
    LINK_NOT_FOUND = "LINK_NOT_FOUND",
    LINK_DISABLED = "LINK_DISABLED",
    LINK_EXPIRED = "LINK_EXPIRED",
    LINK_USAGE_LIMIT_REACHED = "LINK_USAGE_LIMIT_REACHED",
    PAYMENT_UNDERPAID = "PAYMENT_UNDERPAID",
    PAYMENT_CHAIN_NOT_SUPPORTED = "PAYMENT_CHAIN_NOT_SUPPORTED",
    ACCESS_DENIED = "ACCESS_DENIED",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    SUBSCRIPTION_CANCELLED = "SUBSCRIPTION_CANCELLED",
    SUBSCRIPTION_PAST_DUE = "SUBSCRIPTION_PAST_DUE",
    SUBSCRIPTION_PAUSED = "SUBSCRIPTION_PAUSED",
    SUBSCRIPTION_EXPIRED = "SUBSCRIPTION_EXPIRED",
    SUBSCRIPTION_MAX_CYCLES_REACHED = "SUBSCRIPTION_MAX_CYCLES_REACHED"
}
/**
 * 403 Protocol response
 */
interface Protocol403Response {
    protocol: '403-payportal-v1';
    paymentLinkId?: string;
    reasonCode: ReasonCode;
    reasonMessage: string;
    details?: Record<string, unknown>;
}
/**
 * Webhook configuration
 */
interface WebhookConfigType {
    /** Webhook URL to send events to */
    url: string;
    /** Secret for HMAC signature */
    secret?: string;
    /** Events to send */
    events?: Array<'payment.confirmed' | 'payment.pending' | 'payment.failed' | 'payment.underpaid' | 'link.created' | 'link.disabled' | 'subscription.created' | 'subscription.renewed' | 'subscription.cancelled' | 'subscription.paused' | 'subscription.resumed' | 'subscription.past_due' | 'subscription.expired' | 'subscription.trial_ending' | 'subscription.payment_due'>;
    /** Request timeout in ms */
    timeout?: number;
    /** Retry count on failure */
    retries?: number;
}
/**
 * Portal token configuration ($PP)
 */
interface PortalTokenConfigType {
    /** Enable $PP token payments */
    enabled?: boolean;
    /** Discount when paying with $PP token (percentage, 0-100) */
    paymentDiscount?: number;
    /** Enable holder discounts based on $PP balance */
    holderDiscounts?: boolean;
    /** Custom discount tiers */
    discountTiers?: Array<{
        minBalance: number;
        discountPercent: number;
        name: string;
    }>;
}
/**
 * Server configuration
 */
interface PortalConfig {
    /** Server port */
    port?: number;
    /** Base URL for callbacks (e.g., https://your-domain.com) */
    baseUrl?: string;
    /** Base path for payment portal routes (default: /pay) */
    basePath?: string;
    /** Supported blockchain networks */
    chains: ChainConfig[];
    /** Payment timeout in seconds (default: 900) */
    paymentTimeout?: number;
    /** Secret for signing responses */
    signatureSecret?: string;
    /** API key for admin endpoints */
    apiKey?: string;
    /** Enable CORS (default: true) */
    cors?: boolean;
    /** Webhook configuration */
    webhook?: WebhookConfigType;
    /** Portal token configuration ($PP) */
    portalToken?: PortalTokenConfigType;
}
/**
 * Payment check result
 */
interface PaymentCheckResult {
    status: PaymentStatus;
    actualAmount?: string;
    fromAddress?: string;
    raw?: unknown;
}
/**
 * Payment status result (alias for PaymentCheckResult)
 */
type PaymentStatusResult = PaymentCheckResult;
/**
 * Payment provider interface
 */
interface PaymentProvider {
    getPaymentStatus(params: {
        chainId: number;
        recipient: string;
        amount: string;
        txHash?: string;
    }): Promise<PaymentStatusResult>;
}
/**
 * Storage interface
 */
interface Storage {
    getPaymentLink(id: string): Promise<PaymentLink | null>;
    savePaymentLink(paymentLink: PaymentLink): Promise<void>;
    updatePaymentLink(paymentLink: PaymentLink): Promise<void>;
    deletePaymentLink(id: string): Promise<void>;
    getAllPaymentLinks(): Promise<PaymentLink[]>;
    savePayment(payment: Payment): Promise<void>;
    getPaymentByTxHash(txHash: string): Promise<Payment | null>;
    getConfirmedPayment(paymentLinkId: string): Promise<Payment | null>;
    getAllPayments(): Promise<Payment[]>;
    saveSubscription(subscription: Subscription): Promise<void>;
    getSubscription(id: string): Promise<Subscription | null>;
    updateSubscription(subscription: Subscription): Promise<void>;
    getSubscriptionByAddress(paymentLinkId: string, subscriberAddress: string): Promise<Subscription | null>;
    getSubscriptionsByPaymentLink(paymentLinkId: string): Promise<Subscription[]>;
    getSubscriptionsDue(beforeDate: Date): Promise<Subscription[]>;
    getAllSubscriptions(): Promise<Subscription[]>;
}

/**
 * Blockchain payment verifier
 */
declare class ChainVerifier {
    private config;
    private requestId;
    constructor(config: ChainConfig);
    get chainId(): number;
    /**
     * Verify payment on chain
     */
    verifyPayment(params: {
        txHash: string;
        recipient: string;
        amount: string;
    }): Promise<PaymentCheckResult>;
    private rpc;
    private isTokenTransfer;
    private weiToEther;
}
/**
 * Mock verifier for development/testing
 */
declare class MockVerifier {
    private confirmed;
    private pending;
    private failed;
    chainId: number;
    markConfirmed(txHash: string): void;
    markPending(txHash: string): void;
    markFailed(txHash: string): void;
    verifyPayment(params: {
        txHash: string;
        recipient: string;
        amount: string;
    }): Promise<PaymentCheckResult>;
}

/**
 * Solana chain configuration
 */
interface SolanaConfig {
    /** RPC URL (e.g., https://api.mainnet-beta.solana.com) */
    rpcUrl: string;
    /** Number of confirmations required (default: 1) */
    confirmations?: number;
    /** Request timeout in ms (default: 30000) */
    timeout?: number;
}
/**
 * Solana Payment Verifier
 * Verifies native SOL transfers on Solana blockchain
 */
declare class SolanaVerifier {
    private config;
    private requestId;
    constructor(config: SolanaConfig);
    /**
     * Verify a Solana payment
     */
    verifyPayment(params: {
        txHash: string;
        recipient: string;
        amount: string;
    }): Promise<PaymentCheckResult>;
    /**
     * Parse a Solana transaction to extract transfer details
     */
    private parseTransfer;
    /**
     * Get transaction details from Solana RPC
     */
    private getTransaction;
    /**
     * Get signature status
     */
    private getSignatureStatus;
    /**
     * Make an RPC call to Solana
     */
    private rpc;
}
/**
 * Mock Solana verifier for testing
 */
declare class MockSolanaVerifier {
    private confirmed;
    private pending;
    private failed;
    markConfirmed(signature: string): void;
    markPending(signature: string): void;
    markFailed(signature: string): void;
    verifyPayment(params: {
        txHash: string;
        recipient: string;
        amount: string;
    }): Promise<PaymentCheckResult>;
}
/**
 * Create a Solana verifier
 */
declare function createSolanaVerifier(config: SolanaConfig): SolanaVerifier;

/**
 * Calculate next billing date based on interval
 */
declare function calculateNextBillingDate(fromDate: Date, interval: SubscriptionInterval, intervalCount?: number): Date;
/**
 * Check if subscription is within grace period
 */
declare function isWithinGracePeriod(nextPaymentDue: Date, gracePeriodHours?: number): boolean;
/**
 * Check if subscription payment is due
 */
declare function isPaymentDue(subscription: Subscription): boolean;
/**
 * Check if subscription is in trial period
 */
declare function isInTrialPeriod(subscription: Subscription): boolean;
/**
 * Get interval display name
 */
declare function getIntervalDisplayName(interval: SubscriptionInterval, count?: number): string;
/**
 * Subscription Manager
 * Handles subscription lifecycle and billing
 */
declare class SubscriptionManager {
    private storage;
    private checkInterval;
    constructor(storage: Storage);
    /**
     * Create a new subscription
     */
    createSubscription(paymentLink: PaymentLink, input: CreateSubscriptionInput): Promise<Subscription>;
    /**
     * Process payment for subscription
     */
    processPayment(subscription: Subscription, payment: Payment, paymentLink: PaymentLink): Promise<Subscription>;
    /**
     * Cancel subscription
     */
    cancelSubscription(subscriptionId: string, immediate?: boolean): Promise<Subscription>;
    /**
     * Pause subscription
     */
    pauseSubscription(subscriptionId: string): Promise<Subscription>;
    /**
     * Resume subscription
     */
    resumeSubscription(subscriptionId: string): Promise<Subscription>;
    /**
     * Check subscription access
     * Returns true if subscription grants access to the resource
     */
    checkAccess(subscription: Subscription, paymentLink: PaymentLink): Promise<{
        hasAccess: boolean;
        reason?: string;
        requiresPayment?: boolean;
    }>;
    /**
     * Mark subscription as past due
     */
    markPastDue(subscriptionId: string): Promise<Subscription>;
    /**
     * Get subscription by ID
     */
    getSubscription(id: string): Promise<Subscription | null>;
    /**
     * Get subscription by subscriber address
     */
    getSubscriptionByAddress(paymentLinkId: string, subscriberAddress: string): Promise<Subscription | null>;
    /**
     * Get all subscriptions due for payment
     */
    getDueSubscriptions(): Promise<Subscription[]>;
    /**
     * Start periodic check for due subscriptions
     */
    startPeriodicCheck(intervalMs?: number, onDue?: (subscription: Subscription) => void): void;
    /**
     * Stop periodic check
     */
    stopPeriodicCheck(): void;
}
/**
 * Create subscription manager
 */
declare function createSubscriptionManager(storage: Storage): SubscriptionManager;

type Verifier = ChainVerifier | MockVerifier | SolanaVerifier | MockSolanaVerifier;
/**
 * Portal Server
 * Self-hosted payment portal with blockchain payment verification
 */
declare class PortalServer {
    private app;
    private config;
    private storage;
    private verifiers;
    /**
     * Get verifier for testing (public for test access)
     */
    getVerifier(chainId: number): Verifier | undefined;
    private webhookManager?;
    private subscriptionManager;
    private subscriptionCheckInterval?;
    constructor(config: PortalConfig);
    /**
     * Create appropriate verifier based on chain type
     */
    private createVerifier;
    /**
     * Check if chain ID is a Solana chain
     */
    private isSolanaChainId;
    /**
     * Get Express app instance
     */
    getApp(): Express;
    /**
     * Get storage instance
     */
    getStorage(): Storage;
    /**
     * Set custom storage
     */
    setStorage(storage: Storage): void;
    /**
     * Get subscription manager
     */
    getSubscriptionManager(): SubscriptionManager;
    /**
     * Start server
     */
    start(): void;
    /**
     * Create a new payment link
     */
    createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLink>;
    /**
     * Handle payment link request (public API for middleware)
     */
    handlePaymentLinkRequest(id: string): Promise<{
        type: 'redirect' | 'payment-required' | 'forbidden' | 'not-found';
        targetUrl?: string;
        body?: Protocol402Response | Protocol403Response;
    }>;
    /**
     * Confirm payment with transaction hash (public API)
     */
    confirmPayment(paymentLinkId: string, txHash: string): Promise<{
        status: 'confirmed' | 'pending' | 'failed';
        message?: string;
        chainId?: number;
        tokenSymbol?: string;
    }>;
    /**
     * Get payment link status (public API)
     */
    getStatus(paymentLinkId: string): Promise<'unpaid' | 'paid' | 'forbidden' | 'not_found'>;
    /**
     * Get payment link by ID
     */
    getPaymentLink(id: string): Promise<PaymentLink | null>;
    /**
     * Disable a payment link
     */
    disablePaymentLink(id: string): Promise<void>;
    /**
     * Create a subscription for a subscriber
     */
    createSubscription(paymentLinkId: string, subscriberAddress: string, metadata?: Record<string, unknown>): Promise<Subscription>;
    /**
     * Cancel a subscription
     */
    cancelSubscription(subscriptionId: string): Promise<Subscription>;
    /**
     * Pause a subscription
     */
    pauseSubscription(subscriptionId: string): Promise<Subscription>;
    /**
     * Resume a subscription
     */
    resumeSubscription(subscriptionId: string): Promise<Subscription>;
    /**
     * Get subscription by ID
     */
    getSubscription(id: string): Promise<Subscription | null>;
    /**
     * Start periodic subscription check
     */
    private startSubscriptionCheck;
    /**
     * Stop subscription check
     */
    stopSubscriptionCheck(): void;
    private setupMiddleware;
    private setupRoutes;
    private authMiddleware;
    private handlePaymentLink;
    private handleStatus;
    private handleConfirm;
    /**
     * Handle QR code generation
     */
    private handleQRCode;
    /**
     * Handle subscription creation/renewal
     */
    private handleSubscribe;
    /**
     * Handle get subscription status
     */
    private handleGetSubscription;
    /**
     * Format subscription for response
     */
    private formatSubscriptionResponse;
    private apiCreateLink;
    private apiListLinks;
    private apiGetLink;
    private apiDeleteLink;
    private apiListPayments;
    private apiListSubscriptions;
    private apiGetSubscription;
    private apiCancelSubscription;
    private apiPauseSubscription;
    private apiResumeSubscription;
    private send402;
    private send403;
}
/**
 * Create and start a payment portal server
 */
declare function createServer(config: PortalConfig): PortalServer;

/**
 * In-memory storage implementation
 * Replace with database for production
 */
declare class MemoryStorage$1 implements Storage {
    private links;
    private payments;
    private paymentsByTx;
    private paymentsByLink;
    private subscriptions;
    private subscriptionsByAddress;
    private subscriptionsByLink;
    getPaymentLink(id: string): Promise<PaymentLink | null>;
    savePaymentLink(paymentLink: PaymentLink): Promise<void>;
    updatePaymentLink(paymentLink: PaymentLink): Promise<void>;
    deletePaymentLink(id: string): Promise<void>;
    getAllPaymentLinks(): Promise<PaymentLink[]>;
    savePayment(payment: Payment): Promise<void>;
    getPaymentByTxHash(txHash: string): Promise<Payment | null>;
    getConfirmedPayment(paymentLinkId: string): Promise<Payment | null>;
    getAllPayments(): Promise<Payment[]>;
    saveSubscription(subscription: Subscription): Promise<void>;
    getSubscription(id: string): Promise<Subscription | null>;
    updateSubscription(subscription: Subscription): Promise<void>;
    getSubscriptionByAddress(paymentLinkId: string, subscriberAddress: string): Promise<Subscription | null>;
    getSubscriptionsByPaymentLink(paymentLinkId: string): Promise<Subscription[]>;
    getSubscriptionsDue(beforeDate: Date): Promise<Subscription[]>;
    getAllSubscriptions(): Promise<Subscription[]>;
    /** Clear all data */
    clear(): void;
}

/**
 * In-memory storage implementation for development and testing
 */
declare class MemoryStorage implements Storage {
    private paymentLinks;
    private payments;
    private paymentsByTxHash;
    private paymentsByPaymentLinkId;
    private subscriptions;
    private subscriptionsByAddress;
    private subscriptionsByPaymentLink;
    getPaymentLink(id: string): Promise<PaymentLink | null>;
    savePaymentLink(paymentLink: PaymentLink): Promise<void>;
    updatePaymentLink(paymentLink: PaymentLink): Promise<void>;
    deletePaymentLink(id: string): Promise<void>;
    savePayment(payment: Payment): Promise<void>;
    getPaymentByTxHash(txHash: string): Promise<Payment | null>;
    getConfirmedPayment(paymentLinkId: string): Promise<Payment | null>;
    /**
     * Clear all data (useful for testing)
     */
    clear(): void;
    /**
     * Get all payment links (useful for debugging)
     */
    getAllPaymentLinks(): Promise<PaymentLink[]>;
    /**
     * Get all payments (useful for debugging)
     */
    getAllPayments(): Promise<Payment[]>;
    saveSubscription(subscription: Subscription): Promise<void>;
    getSubscription(id: string): Promise<Subscription | null>;
    updateSubscription(subscription: Subscription): Promise<void>;
    getSubscriptionByAddress(paymentLinkId: string, subscriberAddress: string): Promise<Subscription | null>;
    getSubscriptionsByPaymentLink(paymentLinkId: string): Promise<Subscription[]>;
    getSubscriptionsDue(beforeDate: Date): Promise<Subscription[]>;
    getAllSubscriptions(): Promise<Subscription[]>;
}
/**
 * Create a new in-memory storage instance
 */
declare function createMemoryStorage(): MemoryStorage;

interface MockPaymentConfig {
    /** Default status to return */
    defaultStatus?: 'confirmed' | 'pending' | 'failed';
    /** Simulate network delay in ms */
    simulateDelay?: number;
    /** Simulate underpaid by this percentage (0-100) */
    underpaidPercent?: number;
}
/**
 * Mock payment provider for development and testing
 */
declare class MockPaymentProvider implements PaymentProvider {
    private config;
    private confirmedTxHashes;
    private pendingTxHashes;
    private failedTxHashes;
    constructor(config?: MockPaymentConfig);
    /**
     * Manually mark a transaction as confirmed
     */
    markConfirmed(txHash: string): void;
    /**
     * Manually mark a transaction as pending
     */
    markPending(txHash: string): void;
    /**
     * Manually mark a transaction as failed
     */
    markFailed(txHash: string): void;
    /**
     * Reset all marked transactions
     */
    reset(): void;
    getPaymentStatus(params: {
        chainId: number;
        recipient: string;
        amount: string;
        txHash?: string;
    }): Promise<PaymentStatusResult>;
    private createConfirmedResult;
}
/**
 * Create a mock payment provider
 */
declare function createMockProvider(config?: MockPaymentConfig): MockPaymentProvider;

/**
 * QR Code Generator
 * Generates QR codes for payment links with wallet deep links
 */
/**
 * QR Code options
 */
interface QRCodeOptions {
    /** Size in pixels (default: 256) */
    size?: number;
    /** Margin in modules (default: 4) */
    margin?: number;
    /** Dark color (default: #000000) */
    darkColor?: string;
    /** Light color (default: #ffffff) */
    lightColor?: string;
    /** Output format */
    format?: 'svg' | 'png-base64';
}
/**
 * Payment QR data
 */
interface PaymentQRData {
    /** Chain ID */
    chainId: number;
    /** Recipient address */
    recipient: string;
    /** Amount to pay */
    amount: string;
    /** Token symbol */
    tokenSymbol: string;
    /** Payment link ID */
    paymentLinkId: string;
    /** Callback URL for confirmation */
    confirmUrl: string;
}
/**
 * Generate a payment URI for wallets
 */
declare function generatePaymentURI(data: PaymentQRData): string;
/**
 * Generate QR code as SVG
 */
declare function generateQRCodeSVG(data: string, options?: QRCodeOptions): string;
/**
 * Generate QR code as data URL (base64 PNG simulation via SVG)
 */
declare function generateQRCodeDataURL(data: string, options?: QRCodeOptions): string;
/**
 * Generate complete payment QR code
 */
declare function generatePaymentQR(data: PaymentQRData, options?: QRCodeOptions): {
    uri: string;
    svg: string;
    dataUrl: string;
};

/**
 * Webhook configuration
 */
interface WebhookConfig {
    /** Webhook URL to send events to */
    url: string;
    /** Secret for HMAC signature */
    secret?: string;
    /** Events to send (default: all) */
    events?: WebhookEvent[];
    /** Request timeout in ms (default: 10000) */
    timeout?: number;
    /** Retry count on failure (default: 3) */
    retries?: number;
    /** Custom headers to include */
    headers?: Record<string, string>;
}
/**
 * Webhook event types
 */
type WebhookEvent = 'payment.confirmed' | 'payment.pending' | 'payment.failed' | 'payment.underpaid' | 'link.created' | 'link.disabled' | 'link.expired' | 'subscription.created' | 'subscription.renewed' | 'subscription.cancelled' | 'subscription.paused' | 'subscription.resumed' | 'subscription.past_due' | 'subscription.expired' | 'subscription.trial_ending' | 'subscription.payment_due';
/**
 * Webhook payload base
 */
interface WebhookPayload {
    /** Event type */
    event: WebhookEvent;
    /** Event timestamp */
    timestamp: string;
    /** Unique event ID */
    eventId: string;
    /** Event data */
    data: WebhookPaymentData | WebhookLinkData | WebhookSubscriptionData;
}
/**
 * Payment event data
 */
interface WebhookPaymentData {
    type: 'payment';
    payment: {
        id: string;
        paymentLinkId: string;
        chainId: number;
        txHash: string;
        fromAddress: string;
        amount: string;
        confirmed: boolean;
        createdAt: string;
        confirmedAt?: string;
    };
    paymentLink: {
        id: string;
        targetUrl: string;
        price: {
            amount: string;
            tokenSymbol: string;
            chainId: number;
        };
        recipientAddress: string;
    };
}
/**
 * Link event data
 */
interface WebhookLinkData {
    type: 'link';
    link: {
        id: string;
        targetUrl: string;
        price: {
            amount: string;
            tokenSymbol: string;
            chainId: number;
        };
        recipientAddress: string;
        status: string;
        createdAt: string;
        description?: string;
        maxUses?: number;
        expiresAt?: string;
    };
}
/**
 * Subscription event data
 */
interface WebhookSubscriptionData {
    type: 'subscription';
    subscription: {
        id: string;
        paymentLinkId: string;
        subscriberAddress: string;
        status: string;
        currentPeriodStart: string;
        currentPeriodEnd: string;
        nextPaymentDue: string;
        cycleCount: number;
        createdAt: string;
        cancelledAt?: string;
        pausedAt?: string;
        trialEndsAt?: string;
    };
    paymentLink: {
        id: string;
        targetUrl: string;
        price: {
            amount: string;
            tokenSymbol: string;
            chainId: number;
        };
        recipientAddress: string;
        subscription?: {
            interval: string;
            intervalCount?: number;
        };
    };
}
/**
 * Webhook delivery result
 */
interface WebhookResult {
    success: boolean;
    statusCode?: number;
    error?: string;
    attempts: number;
    duration: number;
}
/**
 * Webhook Manager
 * Handles sending webhook notifications for payment events
 */
declare class WebhookManager {
    private config;
    private queue;
    private processing;
    constructor(config: WebhookConfig);
    /**
     * Check if event type is enabled
     */
    isEventEnabled(event: WebhookEvent): boolean;
    /**
     * Send payment event
     */
    sendPaymentEvent(event: WebhookEvent, payment: Payment, paymentLink: PaymentLink): Promise<WebhookResult | null>;
    /**
     * Send link event
     */
    sendLinkEvent(event: WebhookEvent, paymentLink: PaymentLink): Promise<WebhookResult | null>;
    /**
     * Send subscription event
     */
    sendSubscriptionEvent(event: WebhookEvent, subscription: Subscription, paymentLink: PaymentLink): Promise<WebhookResult | null>;
    /**
     * Queue event for async delivery
     */
    queueEvent(payload: WebhookPayload): void;
    /**
     * Send webhook with retries
     */
    send(payload: WebhookPayload): Promise<WebhookResult>;
    /**
     * Deliver webhook
     */
    private deliver;
    /**
     * Sign payload with HMAC-SHA256
     */
    private sign;
    /**
     * Generate unique event ID
     */
    private generateEventId;
    /**
     * Process queued events
     */
    private processQueue;
    /**
     * Delay helper
     */
    private delay;
}
/**
 * Verify webhook signature
 * Use this in your webhook handler to verify authenticity
 */
declare function verifyWebhookSignature(body: string, signature: string, secret: string): boolean;
/**
 * Create a webhook manager
 */
declare function createWebhookManager(config: WebhookConfig): WebhookManager;

/**
 * Portal Token Integration ($PP)
 * Native token support for Pay Portal
 *
 * Token: $PP
 * Mint: [REPLACE_WITH_PP_TOKEN_MINT_ADDRESS]
 * Chain: Solana
 * Decimals: 6 (standard pump.fun token)
 *
 * ⚠️ CRITICAL: Replace MINT address with actual $PP token mint address before launch
 */

/**
 * Portal Token Constants ($PP)
 */
declare const PORTAL_TOKEN: {
    /** Token mint address - ⚠️ REPLACE WITH ACTUAL $PP TOKEN ADDRESS */
    readonly MINT: "[REPLACE_WITH_PP_TOKEN_MINT_ADDRESS]";
    /** Token symbol */
    readonly SYMBOL: "PP";
    /** Token decimals (pump.fun standard) */
    readonly DECIMALS: 6;
    /** Chain ID (Solana mainnet) */
    readonly CHAIN_ID: 101;
};
/**
 * Discount tiers based on $PP holdings
 */
interface DiscountTier {
    /** Minimum token balance required */
    minBalance: number;
    /** Discount percentage (0-100) */
    discountPercent: number;
    /** Tier name */
    name: string;
}
/**
 * Default discount tiers
 */
declare const DEFAULT_DISCOUNT_TIERS: DiscountTier[];
/**
 * Portal token configuration ($PP)
 */
interface PortalTokenConfig {
    /** Solana RPC URL */
    rpcUrl: string;
    /** Enable $PP token payments */
    enableTokenPayments?: boolean;
    /** Discount when paying with $PP (percentage, 0-100) */
    tokenPaymentDiscount?: number;
    /** Enable holder discounts */
    enableHolderDiscounts?: boolean;
    /** Custom discount tiers (optional) */
    discountTiers?: DiscountTier[];
    /** Request timeout in ms */
    timeout?: number;
}
/**
 * Portal Token Manager ($PP)
 * Handles token balance checks, discounts, and SPL token payment verification
 */
declare class PortalTokenManager {
    private config;
    private requestId;
    constructor(config: PortalTokenConfig);
    /**
     * Get $PP token balance for a wallet
     */
    getTokenBalance(walletAddress: string): Promise<number>;
    /**
     * Get discount tier for a wallet based on $PP holdings
     */
    getDiscountTier(walletAddress: string): Promise<DiscountTier | null>;
    /**
     * Calculate discounted price based on holder tier
     */
    calculateDiscountedPrice(walletAddress: string, originalPrice: number): Promise<{
        price: number;
        discount: number;
        tier: DiscountTier | null;
    }>;
    /**
     * Get price when paying with $PP token
     */
    getTokenPaymentPrice(originalPrice: number): number;
    /**
     * Verify $PP token payment
     */
    verifyTokenPayment(params: {
        txHash: string;
        recipient: string;
        amount: string;
    }): Promise<PaymentCheckResult>;
    /**
     * Parse SPL token transfer from transaction
     */
    private parseTokenTransfer;
    /**
     * Get token accounts for a wallet
     */
    private getTokenAccountsByOwner;
    /**
     * Get transaction details
     */
    private getTransaction;
    /**
     * Make RPC call
     */
    private rpc;
}
/**
 * Create a $PP token manager
 */
declare function createPortalTokenManager(config: PortalTokenConfig): PortalTokenManager;
/**
 * Check if a token symbol is $PP
 */
declare function isPortalToken(symbol: string): boolean;
/**
 * Format $PP amount for display
 */
declare function formatPortalAmount(amount: number): string;

/**
 * Generate short unique ID
 */
declare function generateId(length?: number): string;
/**
 * Generate UUID
 */
declare function generateUUID(): string;
/**
 * Generate nonce
 */
declare function generateNonce(): string;
/**
 * Create HMAC signature
 */
declare function sign(data: string, secret: string): string;
/**
 * Check if date is expired
 */
declare function isExpired(date?: Date): boolean;
/**
 * Check if usage limit reached
 */
declare function isLimitReached(used?: number, max?: number): boolean;
/**
 * Compare amounts
 */
declare function compareAmounts(a: string, b: string): number;
/**
 * Reason code messages
 */
declare const REASON_MESSAGES: Record<string, string>;

export { type ChainConfig, type ChainType, ChainVerifier, type CreatePaymentLinkInput, type CreateSubscriptionInput, DEFAULT_DISCOUNT_TIERS, type DiscountTier, MemoryStorage$1 as MemoryStorage, type MockPaymentConfig, MockPaymentProvider, MockSolanaVerifier, MockVerifier, type MultiPrice, PORTAL_TOKEN, type Payment, type PaymentCheckResult, type PaymentLink, type PaymentLinkStatus, type PaymentOption, type PaymentQRData, type PaymentStatus, type PortalConfig, PortalServer, type PortalTokenConfig, PortalTokenManager, type Price, type Protocol402Response, type Protocol403Response, type QRCodeOptions, REASON_MESSAGES, ReasonCode, SOLANA_CHAIN_IDS, type SolanaConfig, SolanaVerifier, type Storage, type Subscription, type SubscriptionConfig, type SubscriptionInterval, SubscriptionManager, type SubscriptionStatus, type WebhookConfig, type WebhookConfigType, type WebhookEvent, type WebhookLinkData, WebhookManager, type WebhookPayload, type WebhookPaymentData, type WebhookResult, type WebhookSubscriptionData, calculateNextBillingDate, compareAmounts, createMemoryStorage, createMockProvider, createPortalTokenManager, createServer, createSolanaVerifier, createSubscriptionManager, createWebhookManager, formatPortalAmount, generateId, generateNonce, generatePaymentQR, generatePaymentURI, generateQRCodeDataURL, generateQRCodeSVG, generateUUID, getIntervalDisplayName, isExpired, isInTrialPeriod, isLimitReached, isPaymentDue, isPortalToken, isWithinGracePeriod, sign, verifyWebhookSignature };
