import { AppDataSource } from "../Config/AppDataSource";
import { CustomSettings } from "../Entity/CustomSettingsEntity";

export const createCustomSettings = async (orgId : string) :Promise<void> => {

    const customSettingsList :CustomSettings[] = [];
    const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
   
    const settingsCount = await customSetRepo.count({where : {organizationId : orgId}});
    if(settingsCount === 4){return;}

    const setting1 = new CustomSettings();
    setting1.fKey = 'removeFeedbackLogo';
    setting1.fValue = 'false';
    setting1.organizationId = orgId;
    customSettingsList.push(setting1);

    const setting2 = new CustomSettings();
    setting2.fKey = 'activeSurveyLimit';
    setting2.fValue = '5';
    setting2.organizationId = orgId;
    customSettingsList.push(setting2);

    const setting3 = new CustomSettings();
    setting3.fKey = 'folderFeatureActive';
    setting3.fValue = 'true';
    setting3.organizationId = orgId;
    customSettingsList.push(setting3);

    const setting4 = new CustomSettings();
    setting4.fKey = 'surveyResponseCapacity';
    setting4.fValue = '500';
    setting4.organizationId = orgId;
    customSettingsList.push(setting4);

    await customSetRepo.save(customSettingsList);
}