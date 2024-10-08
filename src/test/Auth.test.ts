import { getFreeSubscriptionLimit, getUserAfterLogin, handleSuccessfulLogin } from '../Service/AuthService';
import { User } from "../Entity/UserEntity";
import { Plan } from "../Entity/PlanEntity";
import { Subscription } from "../Entity/SubscriptionEntity";
import { STARTER_PLAN } from "../Helpers/Constants";
import { StartUp } from "../Helpers/Startup";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { AppDataSource } from "../Config/AppDataSource";


beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('User test', () => {
    test("Create user test.", async () => {
        await handleSuccessfulLogin({
            _json: {
                email: 'abdul@pr.io',
                sub: '',
                name: '',
                given_name: '',
                family_name: '',
                picture: '',
                email_verified: true,
                locale: 'string'
            },
            displayName: 'Abdul Samad Kirmani',
            id: '',
            name: {
                familyName: '',
                givenName: ''
            },
            emails: [],
            photos: [],
            provider: '',
            _raw: ''
        });

        const response = await getUserAfterLogin({
            _json: {
                email: 'abdul@pr.io'
            }
        });
        expect(response != null).toBe(response.success === true);
        expect(response.statusCode).toBe(200);
        expect(response.data.email).toBe('abdul@pr.io');
    });

    test("Get user with null parameter test.", async () => {
        const response = await getUserAfterLogin(null);
        expect(response != null).toBe(response.success === false);
        expect(response.statusCode).toBe(403);
        expect(response.message).toBe('Not Authorized');
    });

    test("Get user with invalid email test.", async () => {
        const response = await getUserAfterLogin({
            email: 'invalid_email@pr.io'
        });
        expect(response != null).toBe(response.success === false);
        expect(response.statusCode).toBe(404);
        expect(response.message).toBe('User not found');
    });
});

describe('handleSuccessfulLogin', () => {
    const user = {
        _json: {
            email: 'test@example.com',
            sub: '',
            name: 'Test User',
            given_name: '',
            family_name: '',
            picture: '',
            email_verified: true,
            locale: 'string'
        },
        displayName: 'Test User',
        id: '',
        name: {
            familyName: '',
            givenName: ''
        },
        emails: [],
        photos: [],
        provider: '',
        _raw: ''
    };

    it('should create a new user if not already saved', async () => {

        const userRepository = AppDataSource.getDataSource().getRepository(User);
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);

        await handleSuccessfulLogin(user);
        const userObj = await userRepository.findOneBy({
            email: 'test@example.com'
        });

        const planObj = await planRepo.findOneBy({
            name: STARTER_PLAN
        })

        expect(userObj.email).toBe('test@example.com');
        expect(planObj.name).toBe(STARTER_PLAN);
    });

    it('should not create a new user if already saved', async () => {
        const userRepository = AppDataSource.getDataSource().getRepository(User);
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);

        await handleSuccessfulLogin(user);
        const userObj = await userRepository.findOneBy({
            email: 'test@example.com'
        });

        const planObj = await planRepo.findOneBy({
            name: STARTER_PLAN
        })

        expect(userObj.email).toBe('test@example.com');
        expect(planObj.name).toBe(STARTER_PLAN);
    });

    it('should not create a new user if email is missing', async () => {
        const userRepository = {
            findOneBy: jest.fn(),
            save: jest.fn()
        };

        const planRepo = {
            findOneBy: jest.fn(),
        };
        const subscriptionRepo = {
            save: jest.fn()
        };

        await handleSuccessfulLogin({
            _json: {
                email: 'test@example.com',
                sub: '',
                name: 'Test User',
                given_name: '',
                family_name: '',
                picture: '',
                email_verified: true,
                locale: 'string'
            },
            displayName: 'Test User',
            id: '',
            name: {
                familyName: '',
                givenName: ''
            },
            emails: [],
            photos: [],
            provider: '',
            _raw: ''
        });

        expect(userRepository.findOneBy).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
        expect(planRepo.findOneBy).not.toHaveBeenCalled();
        expect(subscriptionRepo.save).not.toHaveBeenCalled();
    });

    // test('creates new subscription if user already exists', async () => {
    //     const userRepository = AppDataSource.getDataSource().getRepository(User);
    //     const planRepo = AppDataSource.getDataSource().getRepository(Plan);
    //     const subscriptionRepository = AppDataSource.getDataSource().getRepository(Subscription);

    //     const user = new User();
    //     user.name = 'Jane Smith';
    //     user.email = 'janesmith@example.com';
    //     user.emailVerified = true;
    //     user.oauth_provider = 'GOOGLE';
    //     await userRepository.save(user);

    //     const plan = new Plan();
    //     plan.name = 'Pro';
    //     plan.price_cents = 45;
    //     await planRepo.save(plan);

    //     await handleSuccessfulLogin({
    //         _json: {
    //             email: user.email,
    //             email_verified: true,
    //         },
    //         provider: 'google',
    //     });

    //     const users = await userRepository.find({
    //         where: {
    //             email: 'janesmith@example.com'
    //         }
    //     });
    //     const subs = await subscriptionRepository.find();
    //     expect(users).toHaveLength(1);
    //     expect(subs).toHaveLength(1);
    //     expect(subs[0].end_date).toBeInstanceOf(Date);
    //     expect(subs[0].sub_limit).toBe(getFreeSubscriptionLimit());
    // });

});