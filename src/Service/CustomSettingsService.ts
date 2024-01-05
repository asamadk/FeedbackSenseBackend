import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { LOGO_DATA } from "../Constants/CustomSettingsCont";
import { CustomSettings } from "../Entity/CustomSettingsEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";
import { FSCustomSetting } from "../Utils/SettingsUtils/CustomSettingsData";

export const createCustomSettings = async (orgId: string): Promise<void> => {

    const customSettingsList: CustomSettings[] = [];
    const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);

    const settingsCount = await customSetRepo.count({ where: { organizationId: orgId } });
    if (settingsCount === 5) { return; }

    for (const [key, value] of FSCustomSetting) {
        const setting = new CustomSettings();
        setting.fKey = key;
        setting.fValue = value;
        setting.organizationId = orgId;
        customSettingsList.push(setting);
    }

    await customSetRepo.save(customSettingsList);
}

export const fetchDashboardSettings = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Logo removed.');
        const customSettingsRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
        const logoCustomSettings = await customSettingsRepo.findBy({
            organizationId : AuthUserDetails.getInstance().getUserDetails().organization_id,
        });
        const transformedData :any= {};
        logoCustomSettings.forEach(setting => {
            if(setting.fKey === LOGO_DATA){return;}
            transformedData[setting.fKey] = setting.fValue;
        });
        response.data = transformedData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false) 
    }
}