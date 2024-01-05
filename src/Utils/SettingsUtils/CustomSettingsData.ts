
import { 
    ACTIVE_SURVEY_LIMIT, 
    AI_TEXT_ANALYSIS, 
    EXPORT_FEATURE, 
    FOLDER_FEATURE_ACTIVE, 
    REMOVE_FEEDBACK_SENSE_LOGO, 
    SKIP_LOGIC_FEATURE, 
    SURVEY_RESPONSE_CAPACITY, 
    TEAM_SEATS 
} from "../../Constants/CustomSettingsCont";

export const FSCustomSetting = new Map<string, string>();
FSCustomSetting.set(REMOVE_FEEDBACK_SENSE_LOGO, 'false');
FSCustomSetting.set(ACTIVE_SURVEY_LIMIT, '1');
FSCustomSetting.set(FOLDER_FEATURE_ACTIVE, 'true');
FSCustomSetting.set(SURVEY_RESPONSE_CAPACITY, '50');
FSCustomSetting.set(SKIP_LOGIC_FEATURE, 'false');
FSCustomSetting.set(TEAM_SEATS, '1');
FSCustomSetting.set(EXPORT_FEATURE, 'true');
FSCustomSetting.set(AI_TEXT_ANALYSIS, 'true');