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

CREATE TABLE custom_settings (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    fKey VARCHAR(255) NOT NULL,
    fValue LONGTEXT,
    organizationId VARCHAR(36) NOT NULL,
    CONSTRAINT UC_organization_key UNIQUE (organizationId, fKey),
    FOREIGN KEY (organizationId) REFERENCES organization (id) ON DELETE CASCADE
);

CREATE TABLE templates (
    id VARCHAR(36) PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    subCategory VARCHAR(255) NOT NULL,
    data LONGTEXT,
    questionCount INT NOT NULL,
    timeTaken INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL
);

ALTER TABLE templates
ADD COLUMN design_json JSON DEFAULT NULL;

CREATE TABLE `survey_log` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `survey_id` CHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `action_type` VARCHAR(50) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `data_before` TEXT DEFAULT NULL,
    `data_after` TEXT DEFAULT NULL,
    `IP_address` VARCHAR(45) DEFAULT NULL,
    FOREIGN KEY (`survey_id`) REFERENCES `survey`(`id`) ON DELETE CASCADE
);

ALTER TABLE user 
ADD COLUMN role ENUM('OWNER', 'ADMIN', 'USER', 'GUEST') NOT NULL DEFAULT 'OWNER';

ALTER TABLE user ADD isDeleted BOOLEAN DEFAULT FALSE;

-- Add the organization_id column to the Subscription table
ALTER TABLE Subscription ADD organization_id VARCHAR(255) NULL;


-- Establish a foreign key relationship
ALTER TABLE Subscription ADD CONSTRAINT fk_subscription_organization
FOREIGN KEY (organization_id) REFERENCES Organization(id)
ON DELETE CASCADE;

-- present till here

ALTER TABLE plan
ADD price_cents_monthly INT NOT NULL;

ALTER TABLE subscription ADD razorpay_subscription_id VARCHAR(255) NULL;

ALTER TABLE `survey_config`
ADD COLUMN `widget_position` ENUM('top-left', 'top-right', 'bottom-left', 'bottom-right') NULL,
ADD COLUMN `button_color` VARCHAR(255) NOT NULL,
ADD COLUMN `button_text_color` VARCHAR(255) NOT NULL;
