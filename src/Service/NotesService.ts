import { FindOptionsWhere } from "typeorm";
import { logger } from "../Config/LoggerConfig";
import { Notes } from "../Entity/Note";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";
import { NotesServiceHelper } from "../ServiceHelper/NoteServiceHelper";
import { ActivityServiceHelper } from "../ServiceHelper/ActivityServiceHelper";
import { Activity, ActivityStatus, ActivityType } from "../Entity/ActivityEntity";

export const getCSMNotes = async (
    companyId: string, personId: string, page: number, limit: number
): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Task created successfully');
        const offset = (page) * limit;
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const notesRepo = Repository.getNotes();
        const helper = new NotesServiceHelper();

        const whereClause: FindOptionsWhere<Notes> = {
            organization: { id: userInfo.organization_id }
        }

        if (companyId != null && companyId.length > 0) {
            whereClause.company = {
                id: companyId
            }
        }

        if (personId != null && personId.length > 0) {
            whereClause.person = {
                id: personId
            }
        }
        
        const count = await notesRepo.count({ where: whereClause });

        const notesList = await notesRepo.find({
            where: whereClause,
            select: {
                company: {
                    id: true,
                    name: true
                },
                person: {
                    id: true,
                    firstName: true,
                    lastName: true
                },
                owner: {
                    id: true,
                    name: true
                }
            },
            relations: {
                company: true,
                person: true,
                owner: true
            },
            skip: offset,
            take: limit
        });
        response.data = {
            count: count,
            list: notesList,
            stats: await helper.getNotesStats(whereClause)
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}


export const createCSMNote = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Task created successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        if (
            reqBody.title == null || reqBody.title.length < 1 ||
            reqBody.owner == null || reqBody.owner.length < 1 ||
            reqBody.visibility == null || reqBody.visibility.length < 1
        ) {
            throw new Error('Incorrect payload.');
        }

        const notesRepo = Repository.getNotes();
        const note = new Notes();
        if(reqBody.id != null && reqBody.id.length > 0){
            note.id = reqBody.id
        }
        note.title = reqBody.title;
        note.description = reqBody.desc;
        note.owner = reqBody.owner;
        note.visibility = reqBody.visibility;
        note.company = reqBody.company;
        if (reqBody.person && reqBody.person.length > 0) {
            note.person = reqBody.person;
        }
        note.createdBy = userInfo.id as any;
        note.organization = userInfo.organization_id as any;
        
        await notesRepo.save(note);

        const helper = ActivityServiceHelper.getInstance();
        const act = new Activity();
        act.type = ActivityType.Note;
        act.subject = 'Note Created';
        act.description = `${note.person?.firstName} added a Note`;
        act.status = ActivityStatus.Completed;
        act.organization = userInfo.organization_id as any;
        act.company = reqBody.company;
        if (reqBody.person && reqBody.person.length > 0) {
            act.person = reqBody.person;
        }

        helper.addActivity(act);
        await helper.saveActivities();

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const deleteCSMNote = async (noteId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Task created successfully');
        if (noteId == null || noteId.length < 1) { throw new Error('Note Id not found.') }
        const notesRepo = Repository.getNotes();
        await notesRepo.delete(noteId);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}