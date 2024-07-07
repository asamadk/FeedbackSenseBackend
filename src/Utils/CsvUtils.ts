import csvParser from 'csv-parser'
import { Readable } from 'stream';

export function parseCsvData(csv: string) {
    const csvStream = Readable.from(csv);
    return new Promise<any[]>((resolve, reject) => {
        const records: any[] = [];

        csvStream
            .pipe(csvParser())
            .on('data', (record) => {
                records.push(record);
            })
            .on('end', () => {
                resolve(records);
            })
            .on('error', (error) => {
                reject(new Error('Error parsing CSV data: ' + error.message));
            });
    });

}