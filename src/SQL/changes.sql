ALTER TABLE invoice
    ADD COLUMN stripeSubscriptionId VARCHAR(255),
    ADD COLUMN stripeInvoiceId VARCHAR(255),
    ADD COLUMN currency VARCHAR(255),
    ADD COLUMN billingInterval VARCHAR(255);

ALTER TABLE plan
      ADD COLUMN sub_limit VARCHAR(255) NULL