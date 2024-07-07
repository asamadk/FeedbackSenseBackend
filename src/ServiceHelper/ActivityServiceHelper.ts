import { Activity } from "../Entity/ActivityEntity";
import { Repository } from "../Helpers/Repository";

export class ActivityServiceHelper {

    static instance: ActivityServiceHelper;

    static getInstance(): ActivityServiceHelper {
        if (this.instance == null) {
            this.instance = new ActivityServiceHelper();
        }
        return this.instance;
    }

    private activityList: Activity[] = [];

    addActivity(activity: Activity) {
        if (this.activityList == null) {
            this.activityList = [];
        }
        this.activityList.push(activity);
    }

    async saveActivities() {
        if (this.activityList.length > 0) {
            const repo = Repository.getActivity();
            await repo.save(this.activityList);
        }
    }

}