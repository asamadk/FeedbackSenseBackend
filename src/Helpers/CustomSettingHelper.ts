import { AppDataSource } from "../Config/AppDataSource";
import { CustomSettings } from "../Entity/CustomSettingsEntity";

export class CustomSettingsHelper {

    static instance: CustomSettingsHelper;

    static getInstance(orgId: string): CustomSettingsHelper {
        if (this.instance == null) {
            this.instance = new CustomSettingsHelper(orgId);
        }
        return this.instance;
    }

    orgId: string
    settings: {
        key : string,
        value : string
    } | object = {};

    constructor(orgId: string) {
        this.orgId = orgId;
    }

    async initialize(): Promise<void> {
        const customSettingsRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
        const orgCustomSettings = await customSettingsRepo.find({
            where: {
                organizationId: this.orgId
            }
        });
        orgCustomSettings.forEach(set => {
            this.settings[set.fKey] = set.fValue;
        });
    }

    getCustomSettings(key : string):string{
        return this.settings[key];
    }

}