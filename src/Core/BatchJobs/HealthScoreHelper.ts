export type attributeDataType = 'options' | 'date' | 'number' | 'str';

export type metricInfoType = {
    "label": string,
    "value": string,
    "type": attributeDataType,
    "table": string,
    "relation": boolean,
    "path": string
}

// Helper function to map custom operators to SQL where clause syntax
export function mapOperatorToTypeORM(operator: string, value: any): string {
    switch (operator) {
        case 'equals':
            return `= '${value}'`;
        case 'not equals':
            return `!= '${value}'`;
        case 'in list':
            return `IN (${value.split(',').map(val => `'${val}'`).join(', ')})`;
        case 'not in list':
            return `NOT IN (${value.split(',').map(val => `'${val}'`).join(', ')})`;
        case 'contains':
            return `LIKE '%${value}%'`;
        case 'Does not contain':
            return `NOT LIKE '%${value}%'`;
        case 'Is Empty':
            return 'IS NULL';
        case 'Is Not Empty':
            return 'IS NOT NULL';
        case 'Older than X Days':
            return `<= DATE(CURRENT_DATE - INTERVAL '${parseInt(value)}' DAY)`;
        case 'Newer than X Days':
            return `>= DATE(CURRENT_DATE + INTERVAL '${parseInt(value)}' DAY)`;
        case 'greater than':
            return `> '${value}'`;
        case 'less than':
            return `< '${value}'`;
        case 'greater than or equal':
            return `>= '${value}'`;
        case 'less than or equal':
            return `<= '${value}'`;
        case 'BETWEEN':
            // Assuming 'value' is an array with two elements [min, max]
            return `BETWEEN '${value[0]}' AND '${value[1]}'`;
        default:
            console.error(`Unsupported operator: ${operator}`);
            return '';
    }
}