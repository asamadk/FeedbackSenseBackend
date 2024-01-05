import axios from "axios";
import { AppDataSource } from "../../Config/AppDataSource";
import { StartUp } from "../../Helpers/Startup";
import { TestHelper } from "../TestUtils.ts/TestHelper";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('Creating user', () => {
    it('should return a list of items', async () => {
      const response = await axios.get('/login/success');
      console.log("🚀 ~ file: UAT1.test.ts:19 ~ it ~ response:", response)
      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });
    
  });
  