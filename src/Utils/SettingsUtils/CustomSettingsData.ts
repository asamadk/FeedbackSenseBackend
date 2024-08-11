
import {
    ACTIVE_SURVEY_LIMIT,
    ADD_CUSTOM_LOGO,
    AI_TEXT_ANALYSIS,
    COMPANY_TAG,
    EXPORT_FEATURE,
    FOLDER_FEATURE_ACTIVE,
    HEALTH_HISTORY,
    LOGO_DATA,
    PRODUCT_USAGE_TRACKING,
    PUBLISH_AUTOMATION_COUNT,
    REMOVE_FEEDBACK_SENSE_LOGO,
    SKIP_LOGIC_FEATURE,
    SURVEY_RESPONSE_CAPACITY,
    TEAM_ROLES,
    TEAM_SEATS,
    TOTAL_CUSTOMER,
    WORD_CLOUD
} from "../../Constants/CustomSettingsCont";

export const FSCustomSetting = new Map<string, string>();
FSCustomSetting.set(ACTIVE_SURVEY_LIMIT, '500');
FSCustomSetting.set(FOLDER_FEATURE_ACTIVE, 'false');
FSCustomSetting.set(REMOVE_FEEDBACK_SENSE_LOGO, 'false');
FSCustomSetting.set(ADD_CUSTOM_LOGO, 'false');
FSCustomSetting.set(SKIP_LOGIC_FEATURE, 'false');
FSCustomSetting.set(SURVEY_RESPONSE_CAPACITY, '500');
FSCustomSetting.set(TEAM_SEATS, '2');
FSCustomSetting.set(TOTAL_CUSTOMER, '200');
FSCustomSetting.set(LOGO_DATA, '');
FSCustomSetting.set(EXPORT_FEATURE, 'false');
FSCustomSetting.set(AI_TEXT_ANALYSIS, 'false');
FSCustomSetting.set(WORD_CLOUD, 'false');
FSCustomSetting.set(TEAM_ROLES, 'true');
FSCustomSetting.set(PRODUCT_USAGE_TRACKING, 'false');
FSCustomSetting.set(COMPANY_TAG, 'true');
FSCustomSetting.set(HEALTH_HISTORY, 'false');
FSCustomSetting.set(PUBLISH_AUTOMATION_COUNT, '2');