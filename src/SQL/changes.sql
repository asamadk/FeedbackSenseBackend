ALTER TABLE invoice
    ADD COLUMN stripeSubscriptionId VARCHAR(255),
    ADD COLUMN stripeInvoiceId VARCHAR(255),
    ADD COLUMN currency VARCHAR(255),
    ADD COLUMN billingInterval VARCHAR(255);

ALTER TABLE plan
      ADD COLUMN sub_limit VARCHAR(255) NULL

ALTER TABLE survey_config
ADD COLUMN emails VARCHAR(500) DEFAULT NULL;

ALTER TABLE User
ADD COLUMN address VARCHAR(500) DEFAULT NULL,
ADD COLUMN image VARCHAR(255) DEFAULT NULL;

-- present till here

CREATE TABLE custom_settings (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    fKey VARCHAR(255) NOT NULL,
    fValue LONGTEXT,
    organizationId VARCHAR(36) NOT NULL,
    CONSTRAINT UC_organization_key UNIQUE (organizationId, fKey),
    FOREIGN KEY (organizationId) REFERENCES organization (id) ON DELETE CASCADE
);