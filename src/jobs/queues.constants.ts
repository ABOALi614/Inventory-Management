export const QUEUE_LOW_STOCK = 'low-stock';

export const QUEUE_OUTBOUND_INVOICE = 'outbound-invoice';

/** Job names inside queues (BullMQ job name). */
export const JOB_LOW_STOCK_NOTIFY = 'notify-manager';

export const JOB_GENERATE_RECEIPT = 'generate-digital-receipt';

/** Quantity at or below this value triggers a low-stock notification job. */
export const LOW_STOCK_THRESHOLD = 10;
