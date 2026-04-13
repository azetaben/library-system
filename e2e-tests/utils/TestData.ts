import {createFrameworkTestData, type TestDataShape,} from '../helperUtilities/testDataHelpers.ts';
import {logger} from './Logger.ts';

export const testData: TestDataShape = createFrameworkTestData();

export const resetTestData = () => {
    logger.info('Resetting shared framework test data');
    Object.assign(testData, createFrameworkTestData());
};
