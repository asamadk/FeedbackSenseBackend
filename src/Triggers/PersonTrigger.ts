import { AutomationQueue } from "../Core/Automation/AutomationQueue";
import { Person } from "../Entity/PersonEntity";
import { Task } from "../Entity/TaskEntity";
import { Repository } from "../Helpers/Repository";

export class PersonTrigger {

    static async saveBulk(people: Person[]) {
        const updatedList = [];
        const insertList = [];
        people.forEach(person => {
            if (person.id != null && person.id.length > 0) {
                updatedList.push(person);
            } else {
                insertList.push(person);
            }
        });
        await Repository.getPeople().save(people);
        const queue = new AutomationQueue<Task>('person');
        await Promise.all([
            queue.addRecord(insertList, 'insert'),
            queue.addRecord(updatedList, 'update')
        ]);
    }

    static async save(person: Person) {
        await this.saveBulk([person]);
    }

}