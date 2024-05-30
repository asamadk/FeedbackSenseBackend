import { Repository } from "typeorm";
import { AppDataSource } from "../Config/AppDataSource";
import { CustomSettings } from "../Entity/CustomSettingsEntity";

export class CustomSettingsHelper {

    static instance: CustomSettingsHelper;

    static getInstance(): CustomSettingsHelper {
        if (this.instance == null) {
            this.instance = new CustomSettingsHelper();
        }
        return this.instance;
    }

    static parseValue(value : string) :any{
        if (value === 'true') {
            return true;
          }
          if (value === 'false') {
            return false;
          }
          if (!isNaN(Number(value))) {
            return Number(value);
          }
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
    }

    orgId: string
    customSettingsRepo : Repository<CustomSettings>
    settings: {
        key : string,
        value : string
    } | object = {};

    constructor() {
        this.customSettingsRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
    }

    async initialize(orgId : string): Promise<void> {
        this.orgId = orgId;
        const orgCustomSettings = await this.customSettingsRepo.find({
            where: {
                organizationId: this.orgId
            }
        });
        this.settings = {};
        orgCustomSettings.forEach(set => {
            this.settings[set.fKey] = set.fValue;
        });
    }

    getCustomSettings(key : string):string{
        return this.settings[key];
    }

    //Does not saves in database
    setCustomSettings(key : string, value : string){
        if(this.settings == null){
            this.settings = {};
        }
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