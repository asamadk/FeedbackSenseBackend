
import {
    ACTIVE_SURVEY_LIMIT,
    ADD_CUSTOM_LOGO,
    AI_TEXT_ANALYSIS,
    EXPORT_FEATURE,
    FOLDER_FEATURE_ACTIVE,
    LOGO_DATA,
    REMOVE_FEEDBACK_SENSE_LOGO,
    SKIP_LOGIC_FEATURE,
    SURVEY_RESPONSE_CAPACITY,
    TEAM_ROLES,
    TEAM_SEATS,
    WORD_CLOUD
} from "../../Constants/CustomSettingsCont";

export const FSCustomSetting = new Map<string, string>();
FSCustomSetting.set(ACTIVE_SURVEY_LIMIT, '5');
FSCustomSetting.set(FOLDER_FEATURE_ACTIVE, 'false');
FSCustomSetting.set(REMOVE_FEEDBACK_SENSE_LOGO, 'false');
FSCustomSetting.set(ADD_CUSTOM_LOGO, 'false');
FSCustomSetting.set(SKIP_LOGIC_FEATURE, 'true');
FSCustomSetting.set(SURVEY_RESPONSE_CAPACITY, '50');
FSCustomSetting.set(TEAM_SEATS, '1');
FSCustomSetting.set(LOGO_DATA, '');
FSCustomSetting.set(EXPORT_FEATURE, 'true');
FSCustomSetting.set(AI_TEXT_ANALYSIS, 'false');
FSCustomSetting.set(WORD_CLOUD, 'false');
FSCustomSetting.set(TEAM_ROLES, 'false');