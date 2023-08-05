import { Repository } from "typeorm";
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
    customSettingsRepo : Repository<CustomSettings>
    settings: {
        key : string,
        value : string
    } | object = {};

    constructor(orgId: string) {
        this.orgId = orgId;
        this.customSettingsRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
    }

    async initialize(): Promise<void> {
        const orgCustomSettings = await this.customSettingsRepo.find({
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

    //Does not saves in database
    setCustomSettings(key : string, value : string){
        this.settings[key] = value;
    }

    //save updated values in database
    async saveCustomSettings(){
        const orgCustomSettings = await this.customSettingsRepo.find({
            where: {
                organizationId: this.orgId
            }
        });
        orgCustomSettings.forEach(setting => {
            setting.fValue = this.settings[setting.fKey];
        });
        await this.customSettingsRepo.save(orgCustomSettings);
    }

}