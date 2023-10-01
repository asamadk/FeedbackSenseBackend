import { AppDataSource } from "../Config/AppDataSource";
import { CustomSettings } from "../Entity/CustomSettingsEntity";
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